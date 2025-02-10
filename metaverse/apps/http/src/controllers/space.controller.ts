// src/controllers/space.controller.ts
import client from '@repo/db/client';
import { Request, Response } from 'express';
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from '../@types/types';

export const createSpace = async (req: Request, res: Response) => {
  try {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
      console.log(JSON.stringify(parsedData));
      return res.status(400).json({ message: 'Validation failed' });
    }

    if (!parsedData.data.mapId) {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: parseInt(parsedData.data.dimensions.split('x')[0]),
          height: parseInt(parsedData.data.dimensions.split('x')[1]),
          creatorId: req.userId!
        }
      });
      return res.json({ spaceId: space.id });
    }

    const map = await client.map.findFirst({
      where: { id: parsedData.data.mapId },
      select: { mapElements: true, width: true, height: true }
    });

    if (!map) {
      return res.status(400).json({ message: 'Map not found' });
    }

    const space = await client.$transaction(async () => {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId: req.userId!,
        }
      });

      await client.spaceElements.createMany({
        data: map.mapElements.map(e => ({
          spaceId: space.id,
          elementId: e.elementId,
          x: e.x!,
          y: e.y!
        }))
      });

      return space;
    });

    res.json({ spaceId: space.id });
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({ error: 'Failed to create space' });
  }
};

export const deleteSpaceElement = async (req: Request, res: Response) => {
  try {
    const parsedData = DeleteElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation failed' });
    }

    const spaceElement = await client.spaceElements.findFirst({
      where: { id: parsedData.data.id },
      include: { space: true }
    });

    if (!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await client.spaceElements.delete({
      where: { id: parsedData.data.id }
    });

    res.json({ message: 'Element deleted' });
  } catch (error) {
    console.error('Error deleting space element:', error);
    res.status(500).json({ error: 'Failed to delete element' });
  }
};

export const deleteSpace = async (req: Request, res: Response) => {
  try {
    const space = await client.space.findUnique({
      where: { id: req.params.spaceId },
      select: { creatorId: true }
    });

    if (!space) {
      return res.status(400).json({ message: 'Space not found' });
    }

    if (space.creatorId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await client.space.delete({
      where: { id: req.params.spaceId }
    });

    res.json({ message: 'Space deleted' });
  } catch (error) {
    console.error('Error deleting space:', error);
    res.status(500).json({ error: 'Failed to delete space' });
  }
};

export const getAllSpaces = async (req: Request, res: Response) => {
  try {
    const spaces = await client.space.findMany({
      where: { creatorId: req.userId! }
    });

    res.json({
      spaces: spaces.map(s => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail,
        dimensions: `${s.width}x${s.height}`,
      }))
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
};

export const addSpaceElement = async (req: Request, res: Response) => {
  try {
    const parsedData = AddElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation failed' });
    }

    const space = await client.space.findUnique({
      where: {
        id: req.body.spaceId,
        creatorId: req.userId!
      },
      select: { width: true, height: true }
    });

    if (!space) {
      return res.status(400).json({ message: 'Space not found' });
    }

    if (req.body.x < 0 || req.body.y < 0 || req.body.x > space.width || req.body.y > space.height) {
      return res.status(400).json({ message: 'Point is outside of the boundary' });
    }

    await client.spaceElements.create({
      data: {
        spaceId: req.body.spaceId,
        elementId: req.body.elementId,
        x: req.body.x,
        y: req.body.y
      }
    });

    res.json({ message: 'Element added' });
  } catch (error) {
    console.error('Error adding space element:', error);
    res.status(500).json({ error: 'Failed to add element' });
  }
};

export const getSpace = async (req: Request, res: Response) => {
  try {
    const space = await client.space.findUnique({
      where: { id: req.params.spaceId },
      include: {
        elements: {
          include: { element: true }
        },
      }
    });

    if (!space) {
      return res.status(400).json({ message: 'Space not found' });
    }

    res.json({
      dimensions: `${space.width}x${space.height}`,
      elements: space.elements.map(e => ({
        id: e.id,
        element: {
          id: e.element.id,
          imageUrl: e.element.imageUrl,
          width: e.element.width,
          height: e.element.height,
          static: e.element.static
        },
        x: e.x,
        y: e.y
      })),
    });
  } catch (error) {
    console.error('Error fetching space:', error);
    res.status(500).json({ error: 'Failed to fetch space' });
  }
};
