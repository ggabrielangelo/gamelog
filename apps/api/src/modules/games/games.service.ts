import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/http-error';
import type { GameStatus } from '../../utils/game-status';
import type {
  CreateGameInput,
  ListGamesQuery,
  UpdateGameInput,
} from './games.schema';

async function findOwnedGame(userId: string, gameId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado');
  // Decisão da Seção 7.4: um usuário só enxerga seus próprios jogos.
  if (game.userId !== userId) throw new HttpError(403, 'FORBIDDEN', 'Acesso negado');
  return game;
}

async function totalHours(gameId: string): Promise<number> {
  const agg = await prisma.playSession.aggregate({
    where: { gameId },
    _sum: { hours: true },
  });
  return agg._sum.hours ?? 0;
}

export async function listGames(userId: string, query: ListGamesQuery) {
  const games = await prisma.game.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.platform ? { platform: query.platform } : {}),
      ...(query.search
        ? { title: { contains: query.search } }
        : {}),
    },
    orderBy: { addedAt: 'desc' },
  });
  return games;
}

export async function createGame(userId: string, data: CreateGameInput) {
  const status: GameStatus = data.status ?? 'BACKLOG';
  const game = await prisma.game.create({
    data: {
      userId,
      title: data.title,
      platform: data.platform,
      genre: data.genre ?? null,
      status,
      coverUrl: data.coverUrl ?? null,
      notes: data.notes ?? null,
      // Se já criar como COMPLETED, preenche finishedAt (regra 8).
      finishedAt: status === 'COMPLETED' ? new Date() : null,
    },
  });
  return game;
}

export async function getGame(_userId: string, gameId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado');
  const hoursTotal = await totalHours(gameId);
  return { ...game, hoursTotal };
}

export async function updateGame(userId: string, gameId: string, data: UpdateGameInput) {
  const current = await findOwnedGame(userId, gameId);

  const nextStatus: GameStatus = (data.status ?? (current.status as GameStatus));

  // Regra 9: rating só é válido em COMPLETED.
  if (data.rating !== undefined && data.rating !== null && nextStatus !== 'COMPLETED') {
    throw new HttpError(
      400,
      'RATING_REQUIRES_COMPLETED',
      'Só é possível avaliar jogos com status Concluído',
    );
  }

  // Se a transição tirou de COMPLETED, o rating deve ser removido também
  // (não faz sentido manter avaliação em jogo que deixou de estar concluído).
  let ratingUpdate: number | null | undefined = data.rating ?? undefined;
  if (data.status !== undefined && data.status !== 'COMPLETED' && current.rating !== null) {
    ratingUpdate = null;
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      title: data.title ?? undefined,
      platform: data.platform ?? undefined,
      genre: data.genre === undefined ? undefined : data.genre,
      status: data.status ?? undefined,
      rating: ratingUpdate,
      coverUrl: data.coverUrl === undefined ? undefined : data.coverUrl,
      notes: data.notes ?? null,
    },
  });

  return updated;
}

export async function deleteGame(userId: string, gameId: string): Promise<void> {
  await findOwnedGame(userId, gameId);
  // Cascade das sessions é garantido via Prisma relation (Seção 7.7).
  await prisma.game.delete({ where: { id: gameId } });
}

export { findOwnedGame, totalHours };
