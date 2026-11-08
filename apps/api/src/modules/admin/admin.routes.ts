import { Router } from 'express';
import { resetDatabase } from './admin.controller';

export const adminRouter = Router();

adminRouter.post('/reset', resetDatabase);
