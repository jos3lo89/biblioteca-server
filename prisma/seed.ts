import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import bcryptjs from 'bcryptjs';

config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('creando usuarios');

  const salt = await bcryptjs.genSalt(10);
  const adminUser = await prisma.user.upsert({
    where: { dni: '11111111' },
    update: {},
    create: {
      dni: '11111111',
      fullName: 'Jose Luis Galindo Cardenas',
      password: await bcryptjs.hash('11111111', salt),
    },
  });

  console.log('usuario administarador es muy pro: ', adminUser);
  console.log('Creando usuario alumno');

  const newUser = await prisma.user.upsert({
    where: { dni: '2222222' },
    update: {},
    create: {
      dni: '2222222',
      fullName: 'lagarto estudioso',
      password: await bcryptjs.hash('2222222', salt),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
