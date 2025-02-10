// src/controllers/user.controller.ts

import client from '@repo/db/client';
import { Request, Response } from 'express';
import { SigninSchema, SignupSchema, UpdateMetadataSchema } from '../@types/types';
import { hash } from '../config/scrypt';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SignupSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: 'Validation failed' });
    return;
  }

  const { username, password, type } = parsedData.data;
  const hashedPassword = await hash(password);

  try {
    const existingUser = await client.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const user = await client.user.create({
      data: {
        username,
        password: hashedPassword,
        role: type === 'admin' ? 'Admin' : 'User'
      }
    });

    res.status(201).json({ userId: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: 'Validation failed' });
    return;
  }

  const { username, password } = parsedData.data;

  try {
    const user = await client.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordCorrect = await hash(password) === user.password;

    if (!isPasswordCorrect) {
      res.status(401).json({ message: 'Incorrect password' });
      return;
    }

    res.status(200).json({ token: user.id });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getElements = async (req: Request, res: Response): Promise<void> => {
  try {
    const elements = await client.element.findMany();

    res.json({
      elements: elements.map((e: any) => ({
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
      }))
    });
  } catch (error) {
    console.error('Error fetching elements:', error);
    res.status(500).json({ error: 'Failed to fetch elements' });
  }
};

export const getAvatars = async (req: Request, res: Response): Promise<void> => {
  try {
    const avatars = await client.avatar.findMany();

    res.json({
      avatars: avatars.map((x: any) => ({
        id: x.id,
        imageUrl: x.imageUrl,
        name: x.name
      }))
    });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    res.status(500).json({ error: 'Failed to fetch avatars' });
  }
};

export const updateMetadata = async (req: Request, res: Response): Promise<void> => {
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: 'Validation failed' });
    return;
  }

  try {
    await client.user.update({
      where: {
        id: req.userId
      },
      data: {
        avatarId: parsedData.data.avatarId
      }
    });

    res.json({ message: 'Metadata updated' });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkMetadataUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = (req.query.ids ?? '[]') as string;
    const userIds = userIdString.slice(1, userIdString.length - 1).split(',');

    const metadata = await client.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        avatar: true,
        id: true
      }
    });

    res.json({
      avatars: metadata.map((m: any) => ({
        userId: m.id,
        avatarId: m.avatar?.imageUrl
      }))
    });
  } catch (error) {
    console.error('Error updating bulk metadata:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
