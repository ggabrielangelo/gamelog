import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/http-error';

const SEED_EMAIL = 'teste@gamelog.com';
const SEED_PASSWORD = 'Senha123';

export async function resetDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) {
      throw new HttpError(500, 'ADMIN_TOKEN_UNSET', 'ADMIN_TOKEN não configurado no servidor');
    }

    const provided = req.header('x-admin-token');
    if (!provided || provided !== expected) {
      throw new HttpError(401, 'INVALID_ADMIN_TOKEN', 'Token administrativo inválido');
    }

    await prisma.playSession.deleteMany({});
    await prisma.game.deleteMany({});
    await prisma.user.deleteMany({});

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: SEED_EMAIL,
        name: 'Usuário de Teste',
        passwordHash,
      },
    });

    res.status(200).json({ ok: true, seededUser: SEED_EMAIL });
  } catch (err) {
    next(err);
  }
}
