const accountService = require("./accountService");

// ============================================
// GET PROFILE
// GET /api/account/me
// ============================================

const getProfile = async (req, res, next) => {
  try {
    const user = await accountService.getProfile(req.user.id);
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE PROFILE
// PATCH /api/account/me
// Body: { name?, email? }
// ============================================

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await accountService.updateProfile(req.user.id, { name, email });
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CHANGE PASSWORD
// PATCH /api/account/me/password
// Body: { currentPassword, newPassword }
// ============================================

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await accountService.changePassword(req.user.id, {
      currentPassword,
      newPassword,
    });
    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPLOAD AVATAR
// POST /api/account/me/avatar
// multipart/form-data field: "avatar"
// ============================================

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Send a file under the field name 'avatar'.",
      });
    }

    const user = await accountService.uploadAvatar(
      req.user.id,
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE AVATAR
// DELETE /api/account/me/avatar
// ============================================

const deleteAvatar = async (req, res, next) => {
  try {
    const user = await accountService.deleteAvatar(req.user.id);
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
};
