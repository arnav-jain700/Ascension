const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    cat << 'EOF' > /var/www/Ascension/testCreateCat.js
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign(
    { id: 'cmnv7qbg30000l4tuyd4uie7a', role: 'ADMIN' },
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
      body: JSON.stringify({ name: "Test Category " + Date.now() })
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
    node /var/www/Ascension/testCreateCat.js
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
