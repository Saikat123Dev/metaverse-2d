// src/routes/user.routes.ts
import { Router } from 'express';
import {
  bulkMetadataUpdate,
  getAvatars,
  getElements,
  signin,
  signup,
  updateMetadata
} from '../controllers/user.controller';
import { userMiddleware } from '../middleware/user';

export const userRouter = Router();

// Public routes
userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.get('/elements', getElements);
userRouter.get('/avatars', getAvatars);

// Protected routes
userRouter.put('/metadata', userMiddleware, updateMetadata);
userRouter.get('/metadata/bulk', userMiddleware, bulkMetadataUpdate);
