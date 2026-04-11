const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `      createdAt: true,
      sessionToken: token,
    },
  });
}));`;

const replacement = `      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: token,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      sessionToken: token,
    },
  });
}));`;

content = content.replace(target, replacement);

// Try replacing with \r\n if \n doesn't work
const targetCRLF = target.replace(/\n/g, '\r\n');
const replacementCRLF = replacement.replace(/\n/g, '\r\n');
content = content.replace(targetCRLF, replacementCRLF);

if (content.includes("res.status(201).json")) {
    fs.writeFileSync(file, content);
    console.log("Successfully fixed auth.ts");
} else {
    console.log("Failed to patch auth.ts");
}
