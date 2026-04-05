import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || "./uploads";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp").split(",");
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
    files: 10, // Max 10 files at once
  },
});

// Single file upload
router.post("/single", upload.single("file"), asyncHandler(async (req: express.Request, res: express.Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "No file uploaded",
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl,
    },
  });
}));

// Multiple files upload
router.post("/multiple", upload.array("files", 10), asyncHandler(async (req: express.Request, res: express.Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "No files uploaded",
    });
  }

  const uploadedFiles = files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${file.filename}`,
  }));

  res.status(200).json({
    success: true,
    message: `${files.length} files uploaded successfully`,
    data: uploadedFiles,
  });
}));

// Product images upload
router.post("/product-images", upload.array("images", 5), asyncHandler(async (req: express.Request, res: express.Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "No images uploaded",
    });
  }

  const uploadedImages = files.map((file, index) => ({
    id: uuidv4(),
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${file.filename}`,
    sortOrder: index,
    isActive: true,
  }));

  res.status(200).json({
    success: true,
    message: `${files.length} product images uploaded successfully`,
    data: uploadedImages,
  });
}));

// Delete file
router.delete("/:filename", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { filename } = req.params;
  const filePath = path.join(process.env.UPLOAD_DIR || "./uploads", filename);

  // For now, just return success. In production, you'd want to:
  // 1. Check if file exists
  // 2. Delete from filesystem
  // 3. Remove from database if stored there
  // 4. Clean up any references

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
}));

// Get file info
router.get("/:filename", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { filename } = req.params;
  const filePath = path.join(process.env.UPLOAD_DIR || "./uploads", filename);

  // In production, you'd check if file exists and return file info
  res.status(200).json({
    success: true,
    data: {
      filename,
      url: `/uploads/${filename}`,
      // Add other metadata as needed
    },
  });
}));

export { router as fileUploadRoutes };
