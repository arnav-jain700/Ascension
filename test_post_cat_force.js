const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    cat << 'INNER_EOF' > /var/www/Ascension/testCreateCatLocalForce.js
const jwt = require('jsonwebtoken');

async function test() {
  require('dotenv').config();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if(!user) { console.log('No ADMIN user found'); return; }
  
  const token = jwt.sign(
    { id: user.id, role: 'ADMIN' },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: "7d" }
  );
  
  try {
    const res = await fetch("http://localhost:5000/api/v1/products/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ name: "Curl Testing Cat Force" })
    });
    
    console.log("Status:", res.status);
    console.log("Payload:", await res.text());
  } catch(e) {
    console.log("Err:", e.message);
  }
}
test().catch(console.error);
INNER_EOF
    cd /var/www/Ascension/apps/backend
    node /var/www/Ascension/testCreateCatLocalForce.js
  `;
  conn.exec(script, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '187.127.150.170', port: 22, username: 'root', password: '7Hgu9l)CTW?RLkQl' });
