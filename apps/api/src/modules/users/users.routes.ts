import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { me } from './users.controller';

export const usersRouter = Router();

usersRouter.get('/me', authMiddleware, me);
