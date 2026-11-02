import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/http-error';
import type { GameStatus } from '../../utils/game-status';
import { findOwnedGame } from './games.service';
import type { CreateSessionInput } from './games.schema';

const PLAYABLE_STATUSES: ReadonlySet<GameStatus> = new Set(['PLAYING', 'COMPLETED']);

export async function createSession(userId: string, gameId: string, data: CreateSessionInput) {
  const game = await findOwnedGame(userId, gameId);

  // Regra 10: sessão só em PLAYING ou COMPLETED.
  if (!PLAYABLE_STATUSES.has(game.status as GameStatus)) {
    throw new HttpError(
      400,
      'SESSION_INVALID_STATUS',
      'Só é possível registrar sessão em jogos com status Jogando ou Concluído',
    );
  }

  const session = await prisma.playSession.create({
    data: {
      userId,
      gameId,
      hours: data.hours,
    },
  });
  return session;
}

export async function listSessions(userId: string, gameId: string) {
  await findOwnedGame(userId, gameId);
  const sessions = await prisma.playSession.findMany({
    where: { gameId },
    orderBy: { playedAt: 'desc' },
  });
  return sessions;
}
