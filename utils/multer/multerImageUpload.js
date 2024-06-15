const multer = require("multer");
const { check } = require("express-validator");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/images"); // Destination folder for images
  },
  filename: function (req, file, cb) {
    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, originalName + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  // Check the MIME type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Validator function for profile picture upload
const UploadImageMulter = () => {
  return [
    upload.single("imageUpload"),
    check("imageUpload").custom((value, { req }) => {
      if (!req.file) {
      }
      return true;
    }),
  ];
};

module.exports = { upload, UploadImageMulter };
