import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuthContext } from "../context/AuthContext";
import { getUserSettings, saveUserSettings } from "../services/settingsApi";
import {
  Palette, Bell, Database, Globe, Moon, Sun, Mail,
  Smartphone, Volume2, Users, AlertTriangle, CheckCircle,
  Download, Upload, Trash2, ChevronRight, RefreshCw, Save,
  AlertCircle, BellRing, UserCircle, ArrowUpRight, Settings as SettingsIcon,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-900 " +
        (enabled ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700")
      }
    >
      <span
        className={
          "inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-200 " +
          (enabled ? "translate-x-6 bg-white dark:bg-gray-900" : "translate-x-1 bg-white dark:bg-gray-400")
        }
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
            <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function Card({ children, className }) {
  return (
    <div className={"bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 " + (className ?? "")}>
      {children}
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(function() {
    if (!toast.show) return;
    const t = setTimeout(onClose, 3500);
    return function() { clearTimeout(t); };
  }, [toast.show, onClose]);

  if (!toast.show) return null;

  const styles = {
    success: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
    error:   "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
    warning: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  };

  const Icon = toast.type === "success" ? CheckCircle : AlertTriangle;

  return (
    <div
      className={"fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-xs font-medium " + (styles[toast.type] ?? styles.success)}
      style={{ animation: "slideUp 0.25s ease-out" }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {toast.message}
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "appearance",    label: "Appearance",    Icon: Palette,  description: "Theme and display"    },
  { id: "notifications", label: "Notifications", Icon: BellRing, description: "Alerts and channels"  },
  { id: "preferences",   label: "Preferences",   Icon: Globe,    description: "Language and behaviour"},
  { id: "data",          label: "Data",          Icon: Database, description: "Export and manage"    },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuthContext();
  const location = useLocation();

  const [activeSection, setActiveSection]   = useState("appearance");
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast]                   = useState({ show: false, message: "", type: "success" });

  const [notifications, setNotifications] = useState({
    newDebtor:            true,
    overdueAlert:         true,
    paymentReceived:      true,
    weeklyReport:         true,
    marketingEmails:      false,
    soundEnabled:         true,
    desktopNotifications: true,
  });

  const [channels, setChannels] = useState({
    email: true,
    sms:   false,
    push:  true,
  });

  const [preferences, setPreferences] = useState({
    language:        "en",
    currency:        "KES",
    dateFormat:      "DD/MM/YYYY",
    timezone:        "Africa/Nairobi",
    autoRefresh:     true,
    refreshInterval: "5",
  });

  // URL hash navigation
  useEffect(function() {
    const hash = location.hash.replace("#", "");
    if (hash && NAV_ITEMS.find(function(n) { return n.id === hash; })) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  // Load settings
  useEffect(function() {
    async function load() {
      setLoading(true);
      try {
        const settings = await getUserSettings();
        if (settings.notifications)        setNotifications(settings.notifications);
        if (settings.notificationChannels) setChannels(settings.notificationChannels);
        if (settings.profile)              setPreferences(function(p) { return Object.assign({}, p, settings.profile); });
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function showToast(message, type) {
    setToast({ show: true, message: message, type: type ?? "success" });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveUserSettings({ notifications: notifications, notificationChannels: channels, profile: preferences });
      showToast("Settings saved", "success");
    } catch (err) {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteAccount() {
    setShowDeleteModal(false);
    showToast("Deactivation request sent. An admin will contact you.", "warning");
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-14 h-14 border-2 border-gray-200 dark:border-gray-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-gray-900 dark:border-white rounded-full animate-spin border-t-transparent" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading settings…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* Sticky top bar — matches Reports/Debtors/Notifications */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              <div>
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                  Settings
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Manage your preferences
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          <div className="flex gap-6">

            {/* Left nav */}
            <aside className="w-52 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                {NAV_ITEMS.map(function(item) {
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={function() { setActiveSection(item.id); }}
                      className={
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left " +
                        (active
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <item.Icon className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p>{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 space-y-4">

              {/* APPEARANCE */}
              {activeSection === "appearance" && (
                <>
                  <Card>
                    <div className="p-6">
                      <SectionHeader
                        title="Theme"
                        description="Choose how the interface looks across all your devices."
                      />
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                          onClick={function() { if (isDarkMode) toggleDarkMode(); }}
                          className={
                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all " +
                            (!isDarkMode
                              ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                              : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700")
                          }
                        >
                          <div className="w-full h-14 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex items-center gap-2">
                            {!isDarkMode && <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-white rounded-full" />}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                          </div>
                        </button>

                        <button
                          onClick={function() { if (!isDarkMode) toggleDarkMode(); }}
                          className={
                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all " +
                            (isDarkMode
                              ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                              : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700")
                          }
                        >
                          <div className="w-full h-14 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            {isDarkMode && <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-white rounded-full" />}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6">
                      <SectionHeader
                        title="Regional"
                        description="Set your local date format and timezone."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Date format
                          </label>
                          <select
                            value={preferences.dateFormat}
                            onChange={function(e) { setPreferences(function(p) { return Object.assign({}, p, { dateFormat: e.target.value }); }); }}
                            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition text-gray-900 dark:text-white"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Timezone
                          </label>
                          <select
                            value={preferences.timezone}
                            onChange={function(e) { setPreferences(function(p) { return Object.assign({}, p, { timezone: e.target.value }); }); }}
                            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition text-gray-900 dark:text-white"
                          >
                            <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* NOTIFICATIONS */}
              {activeSection === "notifications" && (
                <>
                  <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <Bell className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      Choose which events trigger a notification. Changes take effect after saving.
                    </p>
                  </div>

                  <Card>
                    <div className="px-6 pt-6 pb-2">
                      <SectionHeader
                        title="Alert types"
                        description="Select the events you want to be notified about."
                      />
                    </div>
                    <div className="px-6 pb-4">
                      {[
                        { id: "newDebtor",            icon: Users,       label: "New debtor added",    description: "When a new debtor is registered in the system"    },
                        { id: "overdueAlert",         icon: AlertTriangle, label: "Overdue debt alerts", description: "Immediate alerts when a debt passes its due date" },
                        { id: "paymentReceived",      icon: CheckCircle, label: "Payment received",    description: "When an M-Pesa payment is confirmed"              },
                        { id: "weeklyReport",         icon: Mail,        label: "Weekly summary",      description: "Monday morning digest of the previous week"       },
                        { id: "soundEnabled",         icon: Volume2,     label: "Sound alerts",        description: "Play a sound for important notifications"         },
                        { id: "desktopNotifications", icon: Smartphone,  label: "Desktop push",        description: "Browser push notifications while the app is open" },
                        { id: "marketingEmails",      icon: Mail,        label: "Product updates",     description: "Occasional emails about new features"             },
                      ].map(function(item) {
                        return (
                          <SettingRow key={item.id} icon={item.icon} label={item.label} description={item.description}>
                            <Toggle
                              enabled={notifications[item.id]}
                              onChange={function() { setNotifications(function(p) { const n = Object.assign({}, p); n[item.id] = !n[item.id]; return n; }); }}
                              label={item.label}
                            />
                          </SettingRow>
                        );
                      })}
                    </div>
                  </Card>

                  <Card>
                    <div className="px-6 pt-6 pb-2">
                      <SectionHeader
                        title="Delivery channels"
                        description="Choose how you receive your notifications."
                      />
                    </div>
                    <div className="px-6 pb-4">
                      {[
                        { id: "email", icon: Mail,       label: "Email",        description: "Sent to " + (user?.email ?? "your email address") },
                        { id: "sms",   icon: Smartphone, label: "SMS",          description: "Text message to your registered number"           },
                        { id: "push",  icon: Bell,       label: "In-app push",  description: "Shown inside the dashboard in real time"          },
                      ].map(function(item) {
                        return (
                          <SettingRow key={item.id} icon={item.icon} label={item.label} description={item.description}>
                            <Toggle
                              enabled={channels[item.id]}
                              onChange={function() { setChannels(function(p) { const n = Object.assign({}, p); n[item.id] = !n[item.id]; return n; }); }}
                              label={item.label}
                            />
                          </SettingRow>
                        );
                      })}
                    </div>
                  </Card>
                </>
              )}

              {/* PREFERENCES */}
              {activeSection === "preferences" && (
                <>
                  <Card>
                    <div className="p-6">
                      <SectionHeader
                        title="Language & currency"
                        description="Controls how text and monetary values are displayed."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Language
                          </label>
                          <select
                            value={preferences.language}
                            onChange={function(e) { setPreferences(function(p) { return Object.assign({}, p, { language: e.target.value }); }); }}
                            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition text-gray-900 dark:text-white"
                          >
                            <option value="en">English</option>
                            <option value="sw">Swahili</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Default currency
                          </label>
                          <select
                            value={preferences.currency}
                            onChange={function(e) { setPreferences(function(p) { return Object.assign({}, p, { currency: e.target.value }); }); }}
                            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition text-gray-900 dark:text-white"
                          >
                            <option value="KES">Kenyan Shilling (KES)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="px-6 pt-6 pb-2">
                      <SectionHeader
                        title="Dashboard behaviour"
                        description="Control how the dashboard refreshes and fetches data."
                      />
                    </div>
                    <div className="px-6 pb-4">
                      <SettingRow icon={RefreshCw} label="Auto-refresh" description="Automatically reload dashboard data in the background">
                        <Toggle
                          enabled={preferences.autoRefresh}
                          onChange={function() { setPreferences(function(p) { return Object.assign({}, p, { autoRefresh: !p.autoRefresh }); }); }}
                          label="Auto-refresh"
                        />
                      </SettingRow>

                      {preferences.autoRefresh && (
                        <div className="mt-3 pl-10">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Refresh interval
                          </label>
                          <select
                            value={preferences.refreshInterval}
                            onChange={function(e) { setPreferences(function(p) { return Object.assign({}, p, { refreshInterval: e.target.value }); }); }}
                            className="w-44 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition text-gray-900 dark:text-white"
                          >
                            <option value="1">Every minute</option>
                            <option value="5">Every 5 minutes</option>
                            <option value="15">Every 15 minutes</option>
                            <option value="30">Every 30 minutes</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Profile nudge */}
                  <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0">
                      <UserCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Looking for profile or password settings?
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Update your name, email, profile photo and password from My Account.
                      </p>
                      <Link
                        to="/dashboard/account"
                        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition underline underline-offset-2"
                      >
                        Go to My Account
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* DATA */}
              {activeSection === "data" && (
                <>
                  <Card>
                    <div className="p-6">
                      <SectionHeader
                        title="Export"
                        description="Download a full copy of your data at any time."
                      />
                      <div className="space-y-2">
                        {[
                          { label: "Export as CSV",   description: "Debtors, debts and payment records in spreadsheet format", format: "csv"  },
                          { label: "Export as Excel", description: "Full data workbook with multiple sheets",                  format: "xlsx" },
                          { label: "Export as JSON",  description: "Raw structured data for developer use",                    format: "json" },
                        ].map(function(item) {
                          return (
                            <button
                              key={item.format}
                              onClick={function() { showToast("Export initiated — you'll receive an email shortly.", "success"); }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 transition group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                  <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.description}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6">
                      <SectionHeader
                        title="Import"
                        description="Upload data from another system or a previous export."
                      />
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 transition group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                            <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Import data</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">CSV or Excel files · max 10 MB</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                      </button>
                    </div>
                  </Card>

                  {/* Danger zone */}
                  <div className="rounded-2xl border border-red-100 dark:border-red-900/50 overflow-hidden">
                    <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/40 flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Danger zone</p>
                        <p className="text-xs text-red-500 dark:text-red-400">These actions are permanent and cannot be undone.</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 px-6 py-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Deactivate account</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Removes access and schedules data deletion after 30 days.
                        </p>
                      </div>
                      <button
                        onClick={function() { setShowDeleteModal(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Deactivate
                      </button>
                    </div>
                  </div>
                </>
              )}

            </main>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Deactivate account</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">This cannot be undone</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl space-y-2">
                {[
                  "Access to all features will be revoked immediately",
                  "All personal data will be deleted after 30 days",
                  "Active subscriptions will be cancelled",
                ].map(function(item) {
                  return (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-300">{item}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  An administrator will confirm this action before it takes effect.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                onClick={function() { setShowDeleteModal(false); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Deactivate account
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={function() { setToast(function(t) { return Object.assign({}, t, { show: false }); }); }} />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
