const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'src/routes/analytics.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix tsconfig noUncheckedIndexedAccess
content = content.replace(
  "const date = item.createdAt.toISOString().split('T')[0];",
  "const date = item.createdAt.toISOString().split('T')[0] || 'unknown';"
);

fs.writeFileSync(file, content);
console.log('Fixed analytics date index issue');
