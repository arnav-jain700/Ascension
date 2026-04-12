const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const script = `
    tail -n 100 /root/.pm2/logs/ascension-backend-error.log
    tail -n 100 /root/.pm2/logs/ascension-backend-out.log
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
}).on('error', (err) => {
    console.error('Connection error:', err);
}).connect({
  host: '187.127.150.170',
  port: 22,
  username: 'root',
  password: '7Hgu9l)CTW?RLkQl'
});
