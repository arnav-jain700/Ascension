import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ascension.com' },
    update: {
      passwordHash: hashedPassword,
      isActive: true,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@ascension.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin user successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
