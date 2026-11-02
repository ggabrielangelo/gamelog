import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import * as games from './games.controller';
import * as sessions from './sessions.controller';

export const gamesRouter = Router();

gamesRouter.use(authMiddleware);

gamesRouter.get('/', games.list);
gamesRouter.post('/', games.create);
gamesRouter.get('/:id', games.detail);
gamesRouter.patch('/:id', games.update);
gamesRouter.delete('/:id', games.remove);

gamesRouter.get('/:id/sessions', sessions.list);
gamesRouter.post('/:id/sessions', sessions.create);
