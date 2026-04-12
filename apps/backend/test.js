
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAndTest() {
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test' + Date.now() + '@test.com',
      passwordHash: hash,
      name: 'Testy',
      isActive: true
    }
  });

  const res = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: 'password123' })
  });
  
  if(!res.ok) { console.log('Login failed:', res.status, await res.text()); return; }
  const json = await res.json();
  const token = json.data.sessionToken;
  
  console.log('Login success');
  
  const addrRes = await fetch('http://localhost:5000/api/v1/customers/addresses', { headers: { 'Authorization': 'Bearer ' + token } });
  console.log('Addresses status:', addrRes.status);
  
  const secRes = await fetch('http://localhost:5000/api/v1/auth/security/settings', { headers: { 'Authorization': 'Bearer ' + token } });
  console.log('Security status:', secRes.status);
  
  const payRes = await fetch('http://localhost:5000/api/v1/auth/profile/payment-methods', { headers: { 'Authorization': 'Bearer ' + token } });
  console.log('Payment status:', payRes.status);
}
createAndTest().catch(console.error).finally(() => prisma.$disconnect());

