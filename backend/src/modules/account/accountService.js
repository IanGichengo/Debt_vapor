const prisma = require("../../config/database");
const bcrypt = require("bcryptjs");
const cloudinary = require("../../config/cloudinary");

// ============================================
// SAFE USER SHAPE
// Strip password and internal token fields before
// returning user data to the client.
// ============================================

function safeUser(user) {
  const { password, resetToken, resetTokenExp, ...safe } = user;
  return safe;
}

// ============================================
// GET PROFILE
// ============================================

/**
 * Returns the logged-in user's profile together with their
 * current wallet balance — everything the My Account page
 * needs in a single query.
 */
async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: {
        select: { balance: true },
      },
    },
  });

  if (!user) throw new Error("User not found");

  return safeUser(user);
}

// ============================================
// UPDATE PROFILE (name / email)
// ============================================

/**
 * Updates name and/or email.
 * If the user is changing their email we confirm the new
 * address isn't already taken by another account.
 */
async function updateProfile(userId, { name, email }) {
  if (!name && !email) {
    throw new Error("Provide at least one field to update");
  }

  // Email uniqueness check
  if (email) {
    const conflict = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (conflict) throw new Error("Email is already in use by another account");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
    },
  });

  return safeUser(updated);
}

// ============================================
// CHANGE PASSWORD
// ============================================

/**
 * Verifies the current password then replaces it.
 * Social-auth users (Google / Facebook) have no password —
 * we block the change and return a clear message.
 */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.provider !== "LOCAL" || !user.password) {
    throw new Error(
      `Your account uses ${user.provider} sign-in. Password changes are not available.`
    );
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect");

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
}

// ============================================
// UPLOAD AVATAR
// ============================================

/**
 * Uploads a profile photo buffer to Cloudinary and saves
 * the returned secure URL on the user record.
 *
 * We store photos under the "dcs/avatars" folder with the
 * userId as the public_id so re-uploads automatically
 * overwrite the previous version (no orphaned files).
 *
 * @param {string} userId
 * @param {Buffer} fileBuffer  - raw bytes from multer memoryStorage
 * @param {string} mimeType    - e.g. "image/jpeg"
 */
async function uploadAvatar(userId, fileBuffer, mimeType) {
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "dcs/avatars",
        public_id: userId,           // overwrite on re-upload
        overwrite: true,
        invalidate: true,            // bust CDN cache
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: uploadResult.secure_url },
  });

  return safeUser(updated);
}

// ============================================
// DELETE AVATAR
// ============================================

/**
 * Removes the avatar from Cloudinary and clears the URL
 * from the database, reverting to the initials fallback
 * in the UI.
 */
async function deleteAvatar(userId) {
  // Remove from Cloudinary (non-fatal if it doesn't exist there)
  try {
    await cloudinary.uploader.destroy(`dcs/avatars/${userId}`);
  } catch (_) {
    // silently continue — DB update is the source of truth
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });

  return safeUser(updated);
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
};
