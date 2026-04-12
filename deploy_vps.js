const { Client } = require('ssh2');

const conn = new Client();

const deployScript = `
  echo "Pulling latest code and building..."
  
  # Find Ascension directory
  if [ -d "/root/Ascension" ]; then
    DIR="/root/Ascension"
  elif [ -d "/var/www/Ascension" ]; then
    DIR="/var/www/Ascension"
  else
    echo "Ascension directory not found!"
    exit 1
  fi
  
  echo "Changing directory to $DIR"
  cd $DIR
  
  echo "Pulling from git..."
  git pull origin main
  
  echo "Installing dependencies..."
  npm install
  
  echo "Building apps..."
  npm run build
  
  echo "Restarting services via PM2..."
  pm2 restart all || (echo "PM2 not found or failed, restarting manually..." && systemctl restart ascension || echo "Could not restart services")
  
  echo "Deployment Complete!"
`;

conn.on('ready', () => { 
  console.log('Client connected. Executing deployment script...');
  conn.exec(deployScript, (err, stream) => { 
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    })
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data)); 
  }); 
}).connect({ host: '187.127.150.170', port: 22, username: 'root', password: '7Hgu9l)CTW?RLkQl' });
