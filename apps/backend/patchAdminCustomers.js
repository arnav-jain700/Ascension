const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/routes/admin.ts');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

const newRoutes = `
// Get customer details (admin)
router.get("/customers/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      paymentMethods: true,
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
}));

// Update customer details (admin)
router.put("/customers/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const { name, email, phone, gender, dateOfBirth, isActive } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  
  if (gender !== undefined) {
    updateData.gender = gender === "prefer_not" || gender === "prefer-not" ? "PREFER_NOT_TO_SAY" :
                       gender === "non-binary" ? "OTHER" :
                       gender ? gender.toUpperCase() : null;
  }
  
  if (dateOfBirth !== undefined) {
    updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  }
  
  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  const customer = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
}));

// Delete customer address (admin)
router.delete("/customers/:id/addresses/:addressId", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id, addressId } = req.params;

  await prisma.address.delete({
    where: { id: addressId },
  });

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
}));
`;

let normalizedContent = normalize(content);

// Ensure we don't duplicate
if (!normalizedContent.includes('router.get("/customers/:id"')) {
  normalizedContent = normalizedContent.replace('export { router as adminRoutes };', newRoutes + '\nexport { router as adminRoutes };');
  fs.writeFileSync(file, normalizedContent);
  console.log('Patched Admin Customers routes successfully');
} else {
  console.log('Routes already exist.');
}
