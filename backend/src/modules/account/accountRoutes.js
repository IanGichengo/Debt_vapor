const express = require("express");
const router = express.Router();
const multer = require("multer");
const accountController = require("./accountController");
const authenticate = require("../../middleware/authenticate");

// ============================================
// MULTER — memory storage
// We pass the raw buffer straight to Cloudinary's upload_stream
// so there's nothing written to disk on the server.
// ============================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP images are allowed"), false);
    }
  },
});

// All account routes require authentication
router.use(authenticate);

// ============================================
// PROFILE
// ============================================

// GET  /api/account/me          → fetch profile + wallet balance
router.get("/me", accountController.getProfile);

// PATCH /api/account/me         → update name / email
router.patch("/me", accountController.updateProfile);

// ============================================
// PASSWORD
// ============================================

// PATCH /api/account/me/password → change password
router.patch("/me/password", accountController.changePassword);

// ============================================
// AVATAR
// ============================================

// POST   /api/account/me/avatar  → upload / replace avatar
router.post(
  "/me/avatar",
  upload.single("avatar"),
  accountController.uploadAvatar
);

// DELETE /api/account/me/avatar  → remove avatar
router.delete("/me/avatar", accountController.deleteAvatar);

module.exports = router;
