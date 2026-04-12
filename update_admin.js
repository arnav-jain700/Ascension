const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  const script = `
    cd /var/www/Ascension/apps/backend && node -e "
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');
      const prisma = new PrismaClient();
      async function run() {
        const hash = await bcrypt.hash('S3cureP@ss!w0rd', 12);
        await prisma.user.updateMany({
          where: { email: 'arnav4334@gmail.com' },
          data: { role: 'SUPER_ADMIN', passwordHash: hash }
        });
        console.log('Admin user updated successfully');
      }
      run().catch(console.error).finally(()=>prisma.\\$disconnect());
    "
  `;
  conn.exec(script, (err, stream) => { 
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString())); 
  }); 
}).connect({
  host: '187.127.150.170', 
  port: 22, 
  username: 'root', 
  password: '7Hgu9l)CTW?RLkQl'
});
