const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    cd /var/www/Ascension
    pm2 delete all
    killall node || true
    
    pm2 start npm --name "ascension-backend" -- run start --workspace=apps/backend
    pm2 start npm --name "ascension-web" -- run start --workspace=apps/web
    pm2 save
    pm2 status
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
