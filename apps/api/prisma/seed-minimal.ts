import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_EMAIL = 'teste@gamelog.com';
const SEED_PASSWORD = 'Senha123';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {},
    create: {
      email: SEED_EMAIL,
      name: 'Usuário de Teste',
      passwordHash,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seed mínimo concluído. Usuário: ${SEED_EMAIL} / Senha: ${SEED_PASSWORD}`);
  // eslint-disable-next-line no-console
  console.log('Nenhum jogo criado. Cada teste cria o que precisa via API.');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seed-minimal] erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
