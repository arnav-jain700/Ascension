import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'ascensionforathleisure546@ascension.com';
  const password = 'My-Cow-Ate-Supper-HAHA-99!';
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true
    },
    create: {
      email,
      name: 'Ascension Super Admin',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true
    }
  });

  console.log(`Admin user seeded successfully with email: ${adminUser.email}`);

  // Seed product tags
  console.log('Seeding product tags...');
  const products = await prisma.product.findMany();
  let counter = 0;
  for (const p of products) {
    if (!p) continue;
    let tag = counter % 2 === 0 ? "men" : "women";
    await prisma.product.update({
      where: { id: p.id },
      data: { tags: { set: [tag] } }
    });
    counter++;
  }
  console.log('Product tags seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
