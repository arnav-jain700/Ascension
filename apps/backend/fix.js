const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix req.body extraction in PUT /profile
content = content.replace(
  /const \{\s*name,\s*phone,\s*dateOfBirth,\s*gender,\s*\} = req\.body;/g,
  'const {\n    firstName,\n    lastName,\n    phone,\n    dateOfBirth,\n    gender,\n  } = req.body;'
);

// Fix bcrypt argument
content = content.replace(
  'const hashedPassword = await bcrypt.hash(passwordHash, saltRounds);',
  'const hashedPassword = await bcrypt.hash(password, saltRounds);'
);

fs.writeFileSync(file, content);
console.log('Fixed auth.ts');
