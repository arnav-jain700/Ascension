const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    cat << 'EOF' > /var/www/Ascension/testCreateCat2.js
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/var/www/Ascension/apps/backend/.env' });

async function test() {
  const prisma = new PrismaClient();
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  });
  
  if (admins.length === 0) {
    console.log("TEST_FAIL: NO ADMIN USERS FOUND");
    return;
  }
  
  const token = jwt.sign(
    { id: admins[0].id, role: admins[0].role },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: "7d" }
  );
  
  try {
    const res = await fetch("http://localhost:5000/api/v1/products/categories", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: "Bearer " + token 
      },
      body: JSON.stringify({ name: "TestingCat " + Date.now() })
    });
    
    const text = await res.text();
    console.log("Create Category Status:", res.status);
    console.log("Create Category Payload:", text.slice(0, 500));
  } catch (err) {
    console.log("TEST_FAIL_FETCH:", err.message);
  }
}

test().catch(console.error);
EOF
    cd /var/www/Ascension/apps/backend
    node /var/www/Ascension/testCreateCat2.js
  `;
  
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({
  host: '187.127.150.170', port: 22, username: 'root', password: '7Hgu9l)CTW?RLkQl'
});
