const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

const target1 = `      dateOfBirth: true,
      gender: true,
      emailVerified: true,`;

const rep1 = `      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      addresses: true,`;

let normalizedContent = normalize(content);
normalizedContent = normalizedContent.replace(normalize(target1), normalize(rep1));

fs.writeFileSync(file, normalizedContent);
console.log('Patched auth profile GET');
