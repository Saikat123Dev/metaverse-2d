// src/controllers/admin.controller.ts
import client from '@repo/db/client';
import { Request, Response } from 'express';
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from '../@types/types';

export const createElement = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ message: 'Validation failed' });
      return;
    }

    const element = await client.element.create({
      data: {
        width: parsedData.data.width,
        height: parsedData.data.height,
        static: parsedData.data.static,
        imageUrl: parsedData.data.imageUrl,
      }
    });

    res.json({ id: element.id });
  } catch (error) {
    console.error('Error creating element:', error);
    res.status(500).json({ error: 'Failed to create element' });
  }
};

export const updateElement = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ message: 'Validation failed' });
      return;
    }

    await client.element.update({
      where: {
        id: req.params.elementId
      },
      data: {
        imageUrl: parsedData.data.imageUrl
      }
    });

    res.json({ message: 'Element updated' });
  } catch (error) {
    console.error('Error updating element:', error);
    res.status(500).json({ error: 'Failed to update element' });
  }
};

export const createAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ message: 'Validation failed' });
      return;
    }

    const avatar = await client.avatar.create({
      data: {
        name: parsedData.data.name,
        imageUrl: parsedData.data.imageUrl
      }
    });

    res.json({ avatarId: avatar.id });
  } catch (error) {
    console.error('Error creating avatar:', error);
    res.status(500).json({ error: 'Failed to create avatar' });
  }
};

export const createMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ message: 'Validation failed' });
      return;
    }

    const map = await client.map.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split('x')[0]),
        height: parseInt(parsedData.data.dimensions.split('x')[1]),
        thumbnail: parsedData.data.thumbnail,
        mapElements: {
          create: parsedData.data.defaultElements.map(e => ({
            elementId: e.elementId,
            x: e.x,
            y: e.y
          }))
        }
      }
    });

    res.json({ id: map.id });
  } catch (error) {
    console.error('Error creating map:', error);
    res.status(500).json({ error: 'Failed to create map' });
  }
};
