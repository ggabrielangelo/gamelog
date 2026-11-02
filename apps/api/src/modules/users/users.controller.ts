import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/http-error';

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'Não autenticado');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuário não encontrado');
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
