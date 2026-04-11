const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix jwt TS overload bug
content = content.replace(
  '{ expiresIn: process.env.JWT_EXPIRES_IN || "7d" }',
  '{ expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as string }'
);

fs.writeFileSync(file, content);
console.log('Fixed auth.ts jwt');
