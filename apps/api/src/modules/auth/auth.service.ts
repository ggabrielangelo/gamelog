import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { signToken } from '../../config/jwt';
import { HttpError } from '../../utils/http-error';
import type { LoginInput, RegisterInput } from './auth.schema';

const BCRYPT_ROUNDS = 10;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(400, 'EMAIL_IN_USE', 'E-mail já cadastrado');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { user, token };
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Mensagem genérica (Seção 7.2 do CLAUDE.md).
  const invalid = new HttpError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas');
  if (!user) throw invalid;

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw invalid;

  const token = signToken({ sub: user.id, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  };
}
