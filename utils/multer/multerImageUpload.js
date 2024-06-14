const multer = require("multer");
const { check } = require("express-validator");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/images"); // Destination folder for images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg, jpg, or png files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Validator function for profile picture upload
const UploadImageMulter = () => {
  return [
    upload.single("profileImage"),
    check("profileImage").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("No image file uploaded!");
      }

      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error("Only jpeg, jpg, or png files are allowed!");
      }
      return true;
    }),
  ];
};

module.exports = { upload, UploadImageMulter };
