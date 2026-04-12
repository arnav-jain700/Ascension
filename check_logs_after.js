const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    tail -n 20 /root/.pm2/logs/ascension-backend-error.log
    tail -n 20 /root/.pm2/logs/ascension-backend-out.log
    tail -n 20 /root/.pm2/logs/ascension-web-error.log
    tail -n 20 /root/.pm2/logs/ascension-web-out.log
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
