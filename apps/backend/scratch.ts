import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const secret = process.env.JWT_SECRET || 'supersecretkey123';
  console.log("Using secret:", secret);

  // Check if admin user exists
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
     adminUser = await prisma.user.create({
         data: {
             email: "admin_test@ascension.com",
             passwordHash: "x",
             name: "Admin Test",
             role: 'ADMIN'
         }
     });
     console.log("Created admin user:", adminUser.id);
  } else {
     console.log("Found admin user:", adminUser.id);
  }

  const token = jwt.sign({ id: adminUser.id }, secret, { expiresIn: '1d' });
  
  // Make a request to the dashboard
  const response = await fetch('http://localhost:5000/api/v1/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response:", text.substring(0, 500));
}

main().catch(console.error).finally(() => prisma.$disconnect());
