const { Client } = require('ssh2');

const conn = new Client();
console.log('Initiating connection to VPS...');

conn.on('ready', () => {
  console.log('Connected to VPS successfully!');
  console.log('Executing deployment pipeline (This may take 5-10 minutes)...');
  
  const script = `
    set -e
    cd /var/www/Ascension
    
    echo "Fetching latest changes..."
    git pull origin main
    
    echo "Wiping caches..."
    rm -f package-lock.json
    rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/*/.next apps/*/dist packages/*/dist
    
    echo "Installing fresh Linux dependencies..."
    npm install
    
    echo "Generating database schema..."
    npm run db:generate
    
    echo "Pushing schema changes to database..."
    npx prisma db push --schema=./packages/db/prisma/schema.prisma
    
    echo "Building apps..."
    npm run build --workspace=apps/web
    npm run build --workspace=apps/backend
    
    echo "Starting PM2..."
    pm2 stop all || true
    pm2 start npm --name "ascension-backend" -- run start --workspace=apps/backend
    pm2 start npm --name "ascension-web" -- run start --workspace=apps/web
    pm2 save
    
    echo "Deployment Complete!"
  `;
  
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Deployment stream closed.');
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
