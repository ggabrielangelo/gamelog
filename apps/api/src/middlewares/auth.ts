import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../config/jwt';
import { HttpError } from '../utils/http-error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return next(new HttpError(401, 'MISSING_TOKEN', 'Token de autenticação ausente'));
  }
  const token = header.slice(7).trim();
  if (!token) {
    return next(new HttpError(401, 'MISSING_TOKEN', 'Token de autenticação ausente'));
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new HttpError(401, 'INVALID_TOKEN', 'Token inválido ou expirado'));
  }
}
