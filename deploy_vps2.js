const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    set -e
    cd /var/www/Ascension
    git pull origin main
    
    cd packages/db
    npx -y dotenv-cli -e ../../.env -- npx prisma db push --accept-data-loss
    
    cd ../../apps/backend
    npm install
    npm run build
    pm2 restart ascension-backend
    
    cd ../web
    npm install
    npm run build
    pm2 restart ascension-web
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
