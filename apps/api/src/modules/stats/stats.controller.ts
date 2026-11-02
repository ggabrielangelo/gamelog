import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../utils/http-error';
import { computeStats } from './stats.service';

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'Não autenticado');
    const stats = await computeStats(req.user.id);
    res.status(200).json({ stats });
  } catch (err) {
    next(err);
  }
}
