const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const dummyId = "doesntexist123";
    await prisma.$transaction([
      prisma.order.deleteMany({ where: { userId: dummyId } }),
      prisma.payment.deleteMany({ where: { userId: dummyId } }),
      prisma.review.deleteMany({ where: { userId: dummyId } }),
      prisma.wishlistItem.deleteMany({ where: { userId: dummyId } }),
      prisma.wishlist.deleteMany({ where: { userId: dummyId } }),
      prisma.cartItem.deleteMany({ where: { userId: dummyId } }),
      prisma.cart.deleteMany({ where: { userId: dummyId } }),
    ]);
    console.log("Transaction syntax is valid.");
  } catch (err) {
    console.log("Error building transaction:", err.message);
  }
}
test().then(() => prisma.$disconnect()).catch(console.error);
