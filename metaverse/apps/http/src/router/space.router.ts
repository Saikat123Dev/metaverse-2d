// src/routes/space.routes.ts
import { Router } from 'express';
import {
  addSpaceElement,
  createSpace,
  deleteSpace,
  deleteSpaceElement,
  getAllSpaces,
  getSpace
} from '../controllers/space.controller';
import { userMiddleware } from '../middleware/user';

export const spaceRouter = Router();

// Protected routes
spaceRouter.post('/', userMiddleware, createSpace);
spaceRouter.delete('/element', userMiddleware, deleteSpaceElement);
spaceRouter.delete('/:spaceId', userMiddleware, deleteSpace);
spaceRouter.get('/all', userMiddleware, getAllSpaces);
spaceRouter.post('/element', userMiddleware, addSpaceElement);

// Public routes
spaceRouter.get('/:spaceId', getSpace);
