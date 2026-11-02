import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../utils/http-error';
import { createSessionSchema } from './games.schema';
import { createSession, listSessions } from './sessions.service';

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'Não autenticado');
  return req.user;
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const data = createSessionSchema.parse(req.body);
    const session = await createSession(user.id, req.params.id as string, data);
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const sessions = await listSessions(user.id, req.params.id as string);
    res.status(200).json({ sessions });
  } catch (err) {
    next(err);
  }
}
