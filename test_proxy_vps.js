const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    cat << 'EOF' > /var/www/Ascension/testProxy.js
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign(
    { id: 'cmnv7qbg30000l4tuyd4uie7a' },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: "7d" }
  );
  
  try {
    const res = await fetch("http://localhost:3000/api/v1/admin/dashboard", {
      headers: { Authorization: "Bearer " + token }
    });
    
    const text = await res.text();
    console.log("NextJS Proxy response status:", res.status);
    console.log("NextJS Proxy response payload:", text.slice(0, 500));
  } catch (err) {
    console.log("TEST_FAIL_FETCH:", err.message);
  }
}

test().catch(console.error);
EOF
    cd /var/www/Ascension/apps/backend
    node /var/www/Ascension/testProxy.js
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
