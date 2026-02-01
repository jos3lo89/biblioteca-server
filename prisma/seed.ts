import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import bcryptjs from 'bcryptjs';

config();

const pool = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: pool,
});

const userData: Prisma.UserCreateInput[] = [
  {
    dni: '11111111',
    name: 'jose luis',
    lastName: 'galindo cardenas',
    fullName: 'jose luis galindo cardenas',
    password: '123456',
    role: 'ADMIN',
  },
  {
    dni: '22222222',
    name: 'lagarto',
    lastName: 'estudioso',
    fullName: 'lagarto estudioso',
    password: '123456',
    role: 'STUDENT',
  },
];

async function main() {
  console.log(`Start seeding ...`);

  const salt = await bcryptjs.genSalt(10);

  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { dni: u.dni },
      update: {},
      create: {
        ...u,
        password: await bcryptjs.hash(u.password, salt),
      },
    });

    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
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
