const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    cat << 'INNER_EOF' > /var/www/Ascension/testSec.js
const jwt = require('jsonwebtoken');

async function test() {
  require('dotenv').config();
  // Using a known realistic CUID or finding a valid user
  // Let's first find ANY valid user ID from DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst();
  if(!user) { console.log('No user found'); return; }
  
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'test',
    { expiresIn: "7d" }
  );
  
  try {
    const res = await fetch("http://localhost:5000/api/v1/auth/security/settings", {
      method: "GET",
      headers: { Authorization: "Bearer " + token }
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Payload:", text);
  } catch (err) {
    console.log("TEST_FAIL_FETCH:", err.message);
  }
}

test().catch(console.error);
INNER_EOF
    cd /var/www/Ascension/apps/backend
    node /var/www/Ascension/testSec.js
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
