import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../utils/http-error';
import {
  createGameSchema,
  listGamesQuerySchema,
  updateGameSchema,
} from './games.schema';
import {
  createGame,
  deleteGame,
  getGame,
  listGames,
  updateGame,
} from './games.service';

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'Não autenticado');
  return req.user;
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const query = listGamesQuerySchema.parse(req.query);
    const games = await listGames(user.id, query);
    res.status(200).json({ games });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const data = createGameSchema.parse(req.body);
    const game = await createGame(user.id, data);
    res.status(201).json({ game });
  } catch (err) {
    next(err);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const game = await getGame(user.id, req.params.id as string);
    res.status(200).json({ game });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const data = updateGameSchema.parse(req.body);
    const game = await updateGame(user.id, req.params.id as string, data);
    res.status(200).json({ game });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    await deleteGame(user.id, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
