const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/app/account/profile/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

const target1 = `        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      }));
    }
  }, [user]);`;

const rep1 = `        gender: user.gender === "PREFER_NOT_TO_SAY" ? "prefer_not" : user.gender?.toLowerCase() || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        ...(user.addresses && user.addresses.length > 0 ? {
          addressLine1: user.addresses[0].line1 || "",
          addressLine2: user.addresses[0].line2 || "",
          city: user.addresses[0].city || "",
          state: user.addresses[0].state || "",
          postalCode: user.addresses[0].postalCode || "",
          country: user.addresses[0].country || "India",
        } : {})
      }));
    }
  }, [user]);`;

let normalizedContent = normalize(content);
normalizedContent = normalizedContent.replace(normalize(target1), normalize(rep1));

fs.writeFileSync(file, normalizedContent);
console.log('Patched frontend profile auth mapping');
