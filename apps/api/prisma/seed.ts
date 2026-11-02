import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_EMAIL = 'teste@gamelog.com';
const SEED_PASSWORD = 'Senha123';

type SeedGame = {
  title: string;
  platform: string;
  genre: string | null;
  status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'ABANDONED';
  rating?: number | null;
  notes?: string | null;
  finishedAt?: Date | null;
  sessions?: { hours: number }[];
};

const now = new Date();

const seedGames: SeedGame[] = [
  {
    title: 'Hollow Knight',
    platform: 'PC',
    genre: 'Metroidvania',
    status: 'COMPLETED',
    rating: 10,
    finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
    sessions: [{ hours: 2.5 }, { hours: 4 }, { hours: 3 }],
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    platform: 'PC',
    genre: 'RPG',
    status: 'COMPLETED',
    rating: 9,
    finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90),
    sessions: [{ hours: 5 }, { hours: 6.5 }],
  },
  {
    title: 'Elden Ring',
    platform: 'PS5',
    genre: 'Souls-like',
    status: 'PLAYING',
    sessions: [{ hours: 3 }, { hours: 2.25 }, { hours: 4 }],
  },
  {
    title: 'Baldur\'s Gate 3',
    platform: 'PC',
    genre: 'RPG',
    status: 'PLAYING',
    sessions: [{ hours: 6 }, { hours: 3.5 }],
  },
  {
    title: 'The Legend of Zelda: Tears of the Kingdom',
    platform: 'Switch',
    genre: 'Aventura',
    status: 'BACKLOG',
  },
  {
    title: 'Starfield',
    platform: 'Xbox',
    genre: 'RPG',
    status: 'BACKLOG',
  },
  {
    title: 'Hades',
    platform: 'PC',
    genre: 'Roguelike',
    status: 'COMPLETED',
    rating: 8,
    finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180),
    sessions: [{ hours: 1.5 }, { hours: 2 }, { hours: 1 }],
  },
  {
    title: 'Celeste',
    platform: 'Switch',
    genre: 'Plataforma',
    status: 'COMPLETED',
    rating: 10,
    finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 365),
    sessions: [{ hours: 2 }, { hours: 1.5 }],
  },
  {
    title: 'Portal 2',
    platform: 'PC',
    genre: 'Puzzle',
    status: 'COMPLETED',
    rating: null,
    finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14),
    sessions: [{ hours: 2 }, { hours: 1.5 }],
  },
  {
    title: 'Red Dead Redemption 2',
    platform: 'PS5',
    genre: 'Mundo aberto',
    status: 'ABANDONED',
    notes: 'Travou numa missão de pescaria, nunca mais voltei.',
  },
  {
    title: 'Genshin Impact',
    platform: 'Mobile',
    genre: 'RPG',
    status: 'ABANDONED',
    notes: 'Sistema de gacha matou a vontade.',
  },
  {
    title: 'Stardew Valley',
    platform: 'PC',
    genre: 'Simulação',
    status: 'PLAYING',
    sessions: [{ hours: 2 }, { hours: 2.5 }],
  },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {},
    create: {
      email: SEED_EMAIL,
      name: 'Usuário de Teste',
      passwordHash,
    },
  });

  // Zera jogos anteriores do seed user para idempotência.
  await prisma.game.deleteMany({ where: { userId: user.id } });

  for (const g of seedGames) {
    await prisma.game.create({
      data: {
        userId: user.id,
        title: g.title,
        platform: g.platform,
        genre: g.genre,
        status: g.status,
        rating: g.rating ?? null,
        notes: g.notes ?? null,
        finishedAt: g.finishedAt ?? null,
        sessions: g.sessions
          ? {
              create: g.sessions.map((s) => ({ userId: user.id, hours: s.hours })),
            }
          : undefined,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seed concluído. Usuário: ${SEED_EMAIL} / Senha: ${SEED_PASSWORD}`);
  // eslint-disable-next-line no-console
  console.log(`Jogos criados: ${seedGames.length}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seed] erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
