const fs = require('fs');
const path = require('path');

const authPath = path.resolve(__dirname, 'src/routes/auth.ts');
let authContent = fs.readFileSync(authPath, 'utf8');

// Fix register request fields
authContent = authContent.replace(
  'const {\n    name,\n    email,\n    password,\n    phone,\n    dateOfBirth,\n    gender,\n  } = req.body;',
  'const {\n    firstName,\n    lastName,\n    email,\n    password,\n    phone,\n    dateOfBirth,\n    gender,\n  } = req.body;'
);

authContent = authContent.replace(
  'if (!name || !email || !password) {\n    return res.status(400).json({\n      success: false,\n      error: "Validation Error",\n      message: "Name, email, and password are required",\n    });\n  }',
  'if (!firstName || !lastName || !email || !password) {\n    return res.status(400).json({\n      success: false,\n      error: "Validation Error",\n      message: "First name, last name, email, and password are required",\n    });\n  }'
);

authContent = authContent.replace(
  'data: {\n      name,\n      email: email.toLowerCase(),',
  'data: {\n      name: `${firstName} ${lastName}`.trim(),\n      email: email.toLowerCase(),'
);

// We must transform returned user object from Prisma to frontend format
// We will simply regex replace `user` returned structures
// Wait, an easier way is to map the user object before sending it.
// At line 96: data: { user, token } -> data: { user: formatUser(user), token }

authContent = `
const formatUser = (u: any) => {
  if (!u) return u;
  const parts = (u.name || "").split(" ");
  return {
    ...u,
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    name: undefined
  };
};
` + authContent;

authContent = authContent.replace(/data: \{\n      user,\n      token,\n    \},/g, 'data: {\n      user: formatUser(user),\n      token,\n    },');

authContent = authContent.replace(/user: userWithoutPassword,\n      token,/g, 'user: formatUser(userWithoutPassword),\n      token,');

authContent = authContent.replace(/data: user,\n  \}\);/g, 'data: formatUser(user),\n  });');

// Update Profile
authContent = authContent.replace(
  'const {\n    name,\n    phone,\n    dateOfBirth,\n    gender,\n  } = req.body;',
  'const {\n    firstName,\n    lastName,\n    phone,\n    dateOfBirth,\n    gender,\n  } = req.body;'
);

authContent = authContent.replace(
  'if (name) updateData.name = name;',
  'if (firstName || lastName) {\n    const currentParts = (req.user as any).name?.split(" ") || [];\n    const first = firstName || currentParts[0] || "";\n    const last = lastName || currentParts.slice(1).join(" ") || "";\n    updateData.name = `${first} ${last}`.trim();\n  }'
);

fs.writeFileSync(authPath, authContent);

const mwPath = path.resolve(__dirname, 'src/middleware/auth.ts');
let mwContent = fs.readFileSync(mwPath, 'utf8');

mwContent = mwContent.replace(
  'firstName: string;\n    lastName: string;',
  'firstName: string;\n    lastName: string;\n    name?: string;'
);

mwContent = mwContent.replace(
  'req.user = {\n      id: user.id,\n      email: user.email,\n      name: user.name,\n    };',
  'req.user = {\n      id: user.id,\n      email: user.email,\n      name: user.name,\n      firstName: (user.name || "").split(" ")[0] || "",\n      lastName: (user.name || "").split(" ").slice(1).join(" ") || "",\n    };'
);

fs.writeFileSync(mwPath, mwContent);
console.log('Reverse patched auth files to fix frontend profile contract.');
