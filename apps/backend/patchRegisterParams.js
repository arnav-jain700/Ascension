const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

const target1 = `    password,
    phone,
    dateOfBirth,
    gender,
  } = req.body;`;

const rep1 = `    password,
    phone,
    dateOfBirth,
    gender,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  } = req.body;`;

const target2 = `      passwordHash: hashedPassword,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
    },`;

const rep2 = `      passwordHash: hashedPassword,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender === "prefer-not" ? "PREFER_NOT_TO_SAY" :
              gender === "non-binary" ? "OTHER" :
              gender ? gender.toUpperCase() : null,
      addresses: addressLine1 ? {
        create: {
          name: \`\${name} - Primary\`,
          line1: addressLine1,
          line2: addressLine2 || null,
          city: city || "",
          state: state || "",
          postalCode: postalCode || "",
          country: country || "India",
          phone: phone || "",
          isDefault: true,
          type: "SHIPPING"
        }
      } : undefined,
    },`;

let normalizedContent = normalize(content);
normalizedContent = normalizedContent.replace(normalize(target1), normalize(rep1));
normalizedContent = normalizedContent.replace(normalize(target2), normalize(rep2));

fs.writeFileSync(file, normalizedContent);
console.log('Patched auth register params');
