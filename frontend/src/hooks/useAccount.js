import { useState, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import {
  fetchProfile,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  uploadAvatar as apiUploadAvatar,
  deleteAvatar as apiDeleteAvatar,
} from "../services/accountApi";

/**
 * useAccount
 *
 * Manages the logged-in user's profile data, providing:
 * - load()         → fetch fresh profile from the server
 * - updateProfile() → patch name / email
 * - changePassword() → change password (LOCAL accounts only)
 * - uploadAvatar()  → upload a new photo
 * - deleteAvatar()  → remove the photo
 *
 * The hook also syncs the AuthContext user so the Sidebar and
 * Dashboard topbar reflect changes immediately without a reload.
 */
export function useAccount() {
  const { user, setUser } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // LOAD PROFILE
  // ============================================

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      setProfile(data);
      // Keep AuthContext in sync
      if (setUser) setUser((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // ============================================
  // UPDATE PROFILE
  // ============================================

  const updateProfile = useCallback(
    async ({ name, email }) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await apiUpdateProfile({ name, email });
        setProfile(updated);
        if (setUser) setUser((prev) => ({ ...prev, ...updated }));
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setSaving(false);
      }
    },
    [setUser]
  );

  // ============================================
  // CHANGE PASSWORD
  // ============================================

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    setSaving(true);
    setError(null);
    try {
      await apiChangePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  // ============================================
  // UPLOAD AVATAR
  // ============================================

  const uploadAvatar = useCallback(
    async (file) => {
      setAvatarUploading(true);
      setError(null);
      try {
        const updated = await apiUploadAvatar(file);
        setProfile(updated);
        if (setUser) setUser((prev) => ({ ...prev, avatarUrl: updated.avatarUrl }));
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setAvatarUploading(false);
      }
    },
    [setUser]
  );

  // ============================================
  // DELETE AVATAR
  // ============================================

  const deleteAvatar = useCallback(async () => {
    setAvatarUploading(true);
    setError(null);
    try {
      const updated = await apiDeleteAvatar();
      setProfile(updated);
      if (setUser) setUser((prev) => ({ ...prev, avatarUrl: null }));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setAvatarUploading(false);
    }
  }, [setUser]);

  return {
    profile: profile || user,
    loading,
    saving,
    avatarUploading,
    error,
    load,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
  };
}
