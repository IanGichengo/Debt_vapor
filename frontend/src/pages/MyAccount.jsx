import { useState, useEffect, useRef } from "react";
import { useAccount } from "../hooks/useAccount";
import { useWallet } from "../hooks/useWallet";
import {
  UserCircle,
  Mail,
  Lock,
  Camera,
  Trash2,
  Save,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  Banknote,
  Phone,
  FileText,
  Shield,
} from "lucide-react";

// ============================================
// HELPERS
// ============================================

const formatKES = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ============================================
// TOAST — lightweight inline feedback
// ============================================

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300",
    error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-slideInRight ${styles[type]}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  );
}

// ============================================
// SECTION CARD WRAPPER
// ============================================

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ============================================
// AVATAR SECTION
// ============================================

function AvatarSection({ profile, uploadAvatar, deleteAvatar, avatarUploading }) {
  const fileRef = useRef();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) uploadAvatar(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-5">
      {/* Avatar circle */}
      <div className="relative group flex-shrink-0">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-md">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(profile?.name)
          )}
        </div>
        {/* Overlay on hover */}
        <button
          onClick={() => fileRef.current.click()}
          disabled={avatarUploading}
          className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {avatarUploading ? (
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {profile?.name || "—"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {profile?.email}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current.click()}
            disabled={avatarUploading}
            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Camera className="w-3 h-3" />
            {profile?.avatarUrl ? "Change photo" : "Upload photo"}
          </button>
          {profile?.avatarUrl && (
            <button
              onClick={deleteAvatar}
              disabled={avatarUploading}
              className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 hover:border-red-300 hover:text-red-500 text-gray-500 dark:text-gray-400 rounded-lg transition font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          JPEG, PNG or WebP · max 5 MB
        </p>
      </div>
    </div>
  );
}

// ============================================
// PROFILE FORM
// ============================================

function ProfileForm({ profile, onSave, saving }) {
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");

  // Keep fields in sync if parent profile changes
  useEffect(() => {
    setName(profile?.name || "");
    setEmail(profile?.email || "");
  }, [profile?.name, profile?.email]);

  const dirty =
    name !== (profile?.name || "") || email !== (profile?.email || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dirty) return;
    onSave({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-5">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-800">
          {profile?.role || "COLLECTOR"}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Role · contact admin to change
        </span>
      </div>

      <button
        type="submit"
        disabled={!dirty || saving}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition"
      >
        {saving ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save changes
      </button>
    </form>
  );
}

// ============================================
// PASSWORD FORM
// ============================================

function PasswordForm({ profile, onSave, saving }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const isSocial = profile?.provider && profile.provider !== "LOCAL";

  if (isSocial) {
    return (
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mt-2">
        <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your account uses {profile.provider} sign-in. Password management is
          handled by your identity provider.
        </p>
      </div>
    );
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const toggle = (field) => () => setShow((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return;
    const result = await onSave({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    if (result?.success) setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const mismatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;

  const PasswordInput = ({ label, field, showKey }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={set(field)}
          required
          className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={toggle(showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-5">
      <PasswordInput label="Current password" field="currentPassword" showKey="current" />
      <PasswordInput label="New password (min. 8 characters)" field="newPassword" showKey="new" />

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Confirm new password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={show.confirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            required
            className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition ${
              mismatch
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-200 dark:border-gray-600 focus:ring-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={toggle("confirm")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {mismatch && (
          <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving || mismatch || !form.currentPassword || !form.newPassword}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition"
      >
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        Update password
      </button>
    </form>
  );
}

// ============================================
// TRANSACTION ROW
// ============================================

function TxRow({ tx }) {
  const isCredit = tx.type === "CREDIT";
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/60 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCredit
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"
          }`}
        >
          {isCredit ? (
            <ArrowDownLeft className="w-4 h-4" />
          ) : (
            <ArrowUpRight className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {isCredit ? "M-Pesa Payment Received" : "Withdrawal"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {tx.reference || "—"} · {formatDate(tx.createdAt)}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-semibold ${
          isCredit
            ? "text-green-600 dark:text-green-400"
            : "text-red-500 dark:text-red-400"
        }`}
      >
        {isCredit ? "+" : "-"}
        {formatKES(tx.amount)}
      </span>
    </div>
  );
}

// ============================================
// WITHDRAWAL FORM
// ============================================

function WithdrawalForm({ walletBalance, onSubmit, withdrawing }) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit({
      amount: Number(amount),
      phone,
      reason,
    });
    if (result?.success) {
      setAmount("");
      setPhone("");
      setReason("");
    }
  };

  const exceedsBalance = Number(amount) > (walletBalance ?? 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Balance display */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
          Available balance
        </span>
        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
          {formatKES(walletBalance)}
        </span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Amount (KES)
        </label>
        <div className="relative">
          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0"
            className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition ${
              exceedsBalance && amount
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-200 dark:border-gray-600 focus:ring-blue-500"
            }`}
          />
        </div>
        {exceedsBalance && amount && (
          <p className="text-xs text-red-500 mt-1">Exceeds available balance</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          M-Pesa number to send to
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="07XXXXXXXX"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Reason <span className="text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Monthly payout"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={withdrawing || !amount || !phone || exceedsBalance}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition"
      >
        {withdrawing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Banknote className="w-4 h-4" />
        )}
        Request withdrawal
      </button>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Withdrawal requests are reviewed and processed by an admin.
      </p>
    </form>
  );
}

// ============================================
// WITHDRAWAL STATUS BADGE
// ============================================

function WithdrawalBadge({ status }) {
  const styles = {
    PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    APPROVED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    REJECTED: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };
  const icons = {
    PENDING: <Clock className="w-3 h-3" />,
    APPROVED: <CheckCircle className="w-3 h-3" />,
    REJECTED: <XCircle className="w-3 h-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
        styles[status] || styles.PENDING
      }`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MyAccount() {
  const {
    profile,
    loading: profileLoading,
    saving,
    avatarUploading,
    error: profileError,
    load,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
  } = useAccount();

  const {
    wallet,
    transactions,
    pagination,
    withdrawals,
    loading: walletLoading,
    txLoading,
    withdrawing,
    loadWallet,
    loadTransactions,
    submitWithdrawal,
    loadWithdrawals,
  } = useWallet();

  const [toast, setToast] = useState(null);
  const [txPage, setTxPage] = useState(1);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Initial data load
  useEffect(() => {
    load();
    loadWallet();
    loadTransactions(1);
    loadWithdrawals();
  }, []);

  // Reload transactions when page changes
  useEffect(() => {
    loadTransactions(txPage);
  }, [txPage]);

  // ---- handlers ----

  const handleUpdateProfile = async (payload) => {
    const result = await updateProfile(payload);
    showToast(
      result.success ? "Profile updated" : result.message,
      result.success ? "success" : "error"
    );
  };

  const handleChangePassword = async (payload) => {
    const result = await changePassword(payload);
    showToast(
      result.success ? "Password updated" : result.message,
      result.success ? "success" : "error"
    );
    return result;
  };

  const handleUploadAvatar = async (file) => {
    const result = await uploadAvatar(file);
    showToast(
      result.success ? "Photo updated" : result.message,
      result.success ? "success" : "error"
    );
  };

  const handleDeleteAvatar = async () => {
    const result = await deleteAvatar();
    showToast(
      result.success ? "Photo removed" : result.message,
      result.success ? "success" : "error"
    );
  };

  const handleWithdrawal = async (payload) => {
    const result = await submitWithdrawal(payload);
    showToast(
      result.success
        ? "Withdrawal request submitted — pending admin approval"
        : result.message,
      result.success ? "success" : "error"
    );
    if (result.success) loadWithdrawals();
    return result;
  };

  // ============================================
  // LOADING SKELETON
  // ============================================

  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 dark:border-blue-400 rounded-full animate-spin border-t-transparent" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading your account…
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* ── Top bar ── */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                My Account
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your profile, security and wallet
              </p>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
          {/* Global error banner */}
          {profileError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {profileError}
            </div>
          )}

          {/* ── Row 1: Profile card + Security ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile */}
            <SectionCard
              title="Profile"
              subtitle="Your name, email and photo"
              icon={<UserCircle className="w-4 h-4" />}
            >
              <AvatarSection
                profile={profile}
                uploadAvatar={handleUploadAvatar}
                deleteAvatar={handleDeleteAvatar}
                avatarUploading={avatarUploading}
              />
              <ProfileForm
                profile={profile}
                onSave={handleUpdateProfile}
                saving={saving}
              />
            </SectionCard>

            {/* Security */}
            <SectionCard
              title="Security"
              subtitle="Update your password"
              icon={<Lock className="w-4 h-4" />}
            >
              <PasswordForm
                profile={profile}
                onSave={handleChangePassword}
                saving={saving}
              />
            </SectionCard>
          </div>

          {/* ── Row 2: Wallet balance + Withdrawal form ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance hero */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-blue-200" />
                    <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">
                      Wallet Balance
                    </p>
                  </div>
                  {walletLoading ? (
                    <div className="h-10 w-32 bg-white/20 rounded-lg animate-pulse mt-2" />
                  ) : (
                    <p className="text-3xl font-bold mt-2">
                      {formatKES(wallet?.balance)}
                    </p>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-blue-200 mb-1">Received</p>
                    <p className="text-sm font-bold">
                      {formatKES(
                        wallet?.transactions
                          ?.filter((t) => t.type === "CREDIT")
                          .reduce((s, t) => s + t.amount, 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-blue-200 mb-1">Withdrawn</p>
                    <p className="text-sm font-bold">
                      {formatKES(
                        wallet?.transactions
                          ?.filter((t) => t.type === "DEBIT")
                          .reduce((s, t) => s + t.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal form */}
            <div className="lg:col-span-2">
              <SectionCard
                title="Request Withdrawal"
                subtitle="Withdraw funds to your M-Pesa"
                icon={<Banknote className="w-4 h-4" />}
              >
                <WithdrawalForm
                  walletBalance={wallet?.balance}
                  onSubmit={handleWithdrawal}
                  withdrawing={withdrawing}
                />
              </SectionCard>
            </div>
          </div>

          {/* ── Row 3: Transaction history ── */}
          <SectionCard
            title="Transaction History"
            subtitle="All M-Pesa payments and withdrawals"
            icon={<ArrowDownLeft className="w-4 h-4" />}
          >
            {txLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No transactions yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Payments from your debtors will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {transactions.map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Page {pagination.page} of {pagination.pages} ·{" "}
                      {pagination.total} transactions
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                        disabled={txPage === 1}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setTxPage((p) => Math.min(pagination.pages, p + 1))
                        }
                        disabled={txPage === pagination.pages}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>

          {/* ── Row 4: Withdrawal history ── */}
          <SectionCard
            title="Withdrawal Requests"
            subtitle="Status of your payout requests"
            icon={<Clock className="w-4 h-4" />}
          >
            {withdrawals.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                No withdrawal requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatKES(w.amount)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {w.phone} · {formatDate(w.createdAt)}
                      </p>
                      {w.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                          "{w.reason}"
                        </p>
                      )}
                    </div>
                    <WithdrawalBadge status={w.status} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out both; }
      `}</style>
    </>
  );
}
