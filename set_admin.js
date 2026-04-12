const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  conn.exec(`sudo -u postgres psql -d ascension_db -c "UPDATE users SET role = 'ADMIN' WHERE email = 'arnav4334@gmail.com';"`, (err, stream) => { 
    stream.on('close', () => conn.end()).on('data', data => console.log(data.toString())); 
    stream.stderr.on('data', data => console.error(data.toString())); 
  }); 
}).connect({host: '187.127.150.170', port: 22, username: 'root', password: '7Hgu9l)CTW?RLkQl'});
