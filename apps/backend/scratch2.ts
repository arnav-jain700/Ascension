import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);
  await prisma.user.updateMany({
    where: { email: 'admin_test@ascension.com' },
    data: { passwordHash: hashedPassword }
  });
  console.log("Updated password for admin_test@ascension.com to password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
