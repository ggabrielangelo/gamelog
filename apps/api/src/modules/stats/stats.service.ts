import { prisma } from '../../config/prisma';
import type { GameStatus } from '../../utils/game-status';

export interface BacklogStats {
  totalGames: number;
  completed: number;
  playing: number;
  backlog: number;
  abandoned: number;
  totalHours: number;
  avgRating: number | null;
}

export async function computeStats(userId: string): Promise<BacklogStats> {
  const grouped = await prisma.game.groupBy({
    by: ['status'],
    where: { userId },
    _count: { _all: true },
  });

  const counts: Record<GameStatus, number> = {
    BACKLOG: 0,
    PLAYING: 0,
    COMPLETED: 0,
    ABANDONED: 0,
  };
  for (const row of grouped) {
    counts[row.status as GameStatus] = row._count._all;
  }

  const hoursAgg = await prisma.playSession.aggregate({
    where: { userId },
    _sum: { hours: true },
  });

  const ratingAgg = await prisma.game.aggregate({
    where: { userId, status: 'COMPLETED', rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avg =
    ratingAgg._count.rating > 0 && ratingAgg._avg.rating !== null
      ? Math.round(ratingAgg._avg.rating * 10) / 10
      : null;

  return {
    totalGames:
      counts.BACKLOG + counts.PLAYING + counts.COMPLETED + counts.ABANDONED,
    completed: counts.COMPLETED,
    playing: counts.PLAYING,
    backlog: counts.BACKLOG,
    abandoned: counts.ABANDONED,
    totalHours: hoursAgg._sum.hours ?? 0,
    avgRating: avg,
  };
}
