import multer from "multer";

// Configure how files are stored
const storage = multer.diskStorage({
  // Destination to store image
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Make sure this folder exists
  },
  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

// Export the configured upload instance
export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Optional: 5MB file size limit
});