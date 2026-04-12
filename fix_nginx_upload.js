const { Client } = require('ssh2'); 
const conn = new Client(); 
const config = `server {
    server_name shopascension.in www.shopascension.in;
    client_max_body_size 50M;

    # Route all standard web traffic perfectly to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Route all secure checkout data straight to Express Backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Route backend uploaded file assets straight to Express Backend
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/shopascension.in/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/shopascension.in/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = www.shopascension.in) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = shopascension.in) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    server_name shopascension.in www.shopascension.in;
    listen 80;
    return 404; # managed by Certbot
}`;

conn.on('ready', () => { 
  conn.exec(`cat << 'EOF' > /etc/nginx/sites-available/default\n${config}\nEOF\nnginx -t && systemctl restart nginx`, (err, stream) => { 
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d)); 
  }); 
}).connect({ host: '187.127.150.170', port: 22, username: 'root', password: '7Hgu9l)CTW?RLkQl' });
