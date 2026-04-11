const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

const target1 = `// Update user profile
router.put("/profile", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
  } = req.body;

  const updateData: any = {};

  if (firstName || lastName) {
    const currentParts = (req.user as any).name?.split(" ") || [];
    const first = firstName || currentParts[0] || "";
    const last = lastName || currentParts.slice(1).join(" ") || "";
    updateData.name = \`\${first} \${last}\`.trim();
  }
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
}));`;

const rep1 = `// Update user profile
router.put("/profile", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country
  } = req.body;

  const updateData: any = {};

  if (firstName || lastName) {
    const currentParts = (req.user as any).name?.split(" ") || [];
    const first = firstName || currentParts[0] || "";
    const last = lastName || currentParts.slice(1).join(" ") || "";
    updateData.name = \`\${first} \${last}\`.trim();
  }
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  
  if (gender) {
    const mappedGender = gender === "prefer_not" || gender === "prefer-not" ? "PREFER_NOT_TO_SAY" :
                         gender === "non-binary" ? "OTHER" :
                         gender.toUpperCase();
    updateData.gender = mappedGender;
  } else {
    updateData.gender = null;
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Handle address update or creation
  if (addressLine1 && city && state && postalCode && country) {
    const existingAddress = await prisma.address.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          line1: addressLine1,
          line2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phone: phone || existingAddress.phone
        }
      });
    } else {
      await prisma.address.create({
        data: {
          userId: req.user!.id,
          name: user.name + " - Primary",
          line1: addressLine1,
          line2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phone: phone || "",
          isDefault: true,
          type: "SHIPPING"
        }
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
}));`;

let normalizedContent = normalize(content);
if (!normalizedContent.includes(normalize(target1))) {
   console.error("Target block not found!");
} else {
  normalizedContent = normalizedContent.replace(normalize(target1), normalize(rep1));
  fs.writeFileSync(file, normalizedContent);
  console.log('Patched profile PUT route successfully');
}
