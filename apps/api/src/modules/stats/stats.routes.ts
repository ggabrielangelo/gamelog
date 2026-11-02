import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import * as stats from './stats.controller';

export const statsRouter = Router();

statsRouter.get('/', authMiddleware, stats.get);
