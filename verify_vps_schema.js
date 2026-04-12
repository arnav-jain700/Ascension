const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const script = `
    cd /var/www/Ascension
    echo "=== apps/backend/prisma/schema.prisma ==="
    cat apps/backend/prisma/schema.prisma | grep isTwoFactorEnabled || echo "NOT FOUND"
    echo "=== packages/db/prisma/schema.prisma ==="
    cat packages/db/prisma/schema.prisma | grep isTwoFactorEnabled || echo "NOT FOUND"
    echo "=== npm ls ==="
    npm ls @prisma/client -a
  `;
  
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '187.127.150.170',
  port: 22,
  username: 'root',
  password: '7Hgu9l)CTW?RLkQl'
});
