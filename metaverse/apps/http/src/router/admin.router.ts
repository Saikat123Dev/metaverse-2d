// src/routes/admin.routes.ts
import { Router } from 'express';
import {
  createAvatar,
  createElement,
  createMap,
  updateElement
} from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin';

export const adminRouter = Router();

// Apply admin middleware to all routes
adminRouter.use(adminMiddleware);

// Admin routes
adminRouter.post('/element', createElement);
adminRouter.put('/element/:elementId', updateElement);
adminRouter.post('/avatar', createAvatar);
adminRouter.post('/map', createMap);
