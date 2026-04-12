const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const script = `
    pm2 logs ascension-backend --lines 500 --nostream
    pm2 logs ascension-web --lines 500 --nostream
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
