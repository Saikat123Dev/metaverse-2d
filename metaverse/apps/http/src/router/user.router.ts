
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

userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.get('/elements', getElements);
userRouter.get('/avatars', getAvatars);

userRouter.put('/metadata', userMiddleware, updateMetadata);
userRouter.get('/metadata/bulk', userMiddleware, bulkMetadataUpdate);
