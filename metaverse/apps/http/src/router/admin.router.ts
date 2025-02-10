
import { Router } from 'express';
import {
  createAvatar,
  createElement,
  createMap,
  updateElement
} from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin';

export const adminRouter = Router();



adminRouter.post('/element',adminMiddleware, createElement);
adminRouter.put('/element/:elementId',adminMiddleware, updateElement);
adminRouter.post('/avatar',adminMiddleware, createAvatar);
adminRouter.post('/map',adminMiddleware, createMap);
