import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {


  const product = await prisma.product.upsert({
    where: { slug: 'test-premium-t-shirt' },
    update: {},
    create: {
      name: 'Test Premium T-Shirt',
      slug: 'test-premium-t-shirt',
      description: 'A premium t-shirt for testing.',
      sku: 'TEST-TSHIRT-001',
      price: 29.99,
      color: 'Black',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Test Product' }
        ]
      },
      variants: {
        create: [
          { sku: 'TEST-TSHIRT-001-M', price: 29.99, name: 'M', trackInventory: false, inventory: 100 },
          { sku: 'TEST-TSHIRT-001-L', price: 29.99, name: 'L', trackInventory: false, inventory: 100 }
        ]
      }
    }
  });
  console.log('Seeded test product:', product.slug);
}

main().catch(console.error).finally(() => prisma.$disconnect());
