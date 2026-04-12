const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const script = `
    cd /var/www/Ascension
    
    echo "Rebuilding frontend..."
    npm run build --workspace=apps/web
    
    echo "Restarting frontend..."
    pm2 restart ascension-web
  `;
  
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
      console.log('Fixed Web on VPS');
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
