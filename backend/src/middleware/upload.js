import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';

/**
 * Configure multer for file uploads
 */
const storage = multer.memoryStorage(); // Store files in memory for S3 upload

const fileFilter = (req, file, cb) => {
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  // Check if file type is allowed
  if (config.upload.allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not allowed. Allowed types: ${config.upload.allowedFileTypes.join(', ')}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1, // Only allow one file at a time
  },
});

/**
 * Middleware to handle file upload errors
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB`,
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Use "comic" field for file upload',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'File upload error',
    });
  }
  
  // Handle other file filter errors
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  
  next(error);
};