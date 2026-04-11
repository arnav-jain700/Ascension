const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/hooks/use-auth.ts');
let content = fs.readFileSync(file, 'utf8');

const target1 = `  email: string;
  phone?: string;
  role: "customer" | "admin";`;

const rep1 = `  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  addresses?: any[];
  role: "customer" | "admin";`;

content = content.replace(target1, rep1);

fs.writeFileSync(file, content);
console.log('Patched frontend auth context');
