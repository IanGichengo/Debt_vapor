import { useState, useEffect, useRef } from "react";
import whatsappApi from "../../services/whatsappApi";
import {
  getReminderSettings,
  saveReminderSettings,
  getDefaultReminderSettings,
  saveDefaultReminderSettings
} from "../../services/reminderService";

/**
 * WhatsAppAction Component
 * Handles AI-powered template reminders and automated schedule settings.
 */
export default function WhatsAppAction({ debtorId, debtorPhone, onSend, disabled }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hard lock: survives re-renders, never stale like setState
  const isSendingRef = useRef(false);

  // Cache: prevents repeated network calls for the same debtorId
  const settingsCacheRef = useRef({});

  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    interval: 7,
    maxReminders: 3,
  });

  // Load settings from backend or local fallback on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!debtorId) return;

      // Return immediately if we've already fetched for this debtor
      if (settingsCacheRef.current[debtorId]) {
        setReminderSettings(settingsCacheRef.current[debtorId]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const debtorSettings = await getReminderSettings(debtorId);

        if (debtorSettings) {
          settingsCacheRef.current[debtorId] = debtorSettings;
          setReminderSettings(debtorSettings);
        } else {
          // No debtor-specific settings — try user defaults
          const defaultSettings = await getDefaultReminderSettings();
          const resolved = defaultSettings ?? reminderSettings;
          settingsCacheRef.current[debtorId] = resolved;
          setReminderSettings(resolved);
        }
      } catch (err) {
        // Treat 404 as "not found", not a real error
        const is404 = err?.status === 404 || err?.response?.status === 404;

        if (!is404) {
          console.error("Error loading reminder settings:", err);
        }

        // Fallback chain: localStorage → initial state
        try {
          const local = localStorage.getItem(`reminderSettings_${debtorId}`);
          const resolved = local ? JSON.parse(local) : reminderSettings;
          settingsCacheRef.current[debtorId] = resolved;
          setReminderSettings(resolved);
        } catch (localErr) {
          console.error("Error loading from localStorage:", localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [debtorId]);

  /**
   * Triggers the AI-Personalized WhatsApp Template message
   */
  const handleSend = async () => {
    // Gate 1: ref check (synchronous, no stale-closure risk)
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    // Gate 2: reflect in UI
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await whatsappApi.sendAIReminderToDebtor(debtorId);

      if (onSend) await onSend();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      let errorMessage = "Failed to send message";

      if (err.isWhatsAppError) {
        errorMessage = err.message;
      } else if (err.isTemplateError) {
        errorMessage = "WhatsApp Template not approved. Please check Meta Dashboard.";
      } else {
        errorMessage = err.message || "Failed to connect to WhatsApp service";
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 6000);
    } finally {
      // Always release both locks
      isSendingRef.current = false;
      setSending(false);
    }
  };

  /**
   * Saves reminder schedule settings to backend and local storage
   */
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveReminderSettings(debtorId, reminderSettings),
        saveDefaultReminderSettings(reminderSettings)
      ]);

      localStorage.setItem(`reminderSettings_${debtorId}`, JSON.stringify(reminderSettings));
      localStorage.setItem('defaultReminderSettings', JSON.stringify(reminderSettings));

      // Keep cache in sync so re-mounts don't hit the network with stale data
      settingsCacheRef.current[debtorId] = reminderSettings;

      setShowSettings(false);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Error saving reminder settings:", err);
      setError("Settings saved locally. Backend sync failed.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setReminderSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-6">
      {/* Main Action Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800/40 border border-green-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

          {/* Left Side: Info & AI Badge */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">AI WhatsApp Reminder</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Reaching: <span className="font-semibold">{debtorPhone || 'Selected Debtor'}</span>
                </p>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Safe Delivery Mode: Uses approved templates with Gemini AI personalization.</span>
            </div>

            {reminderSettings.enabled && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Auto-reminders: Every {reminderSettings.interval} days
              </div>
            )}
          </div>

          {/* Right Side: Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-row">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Settings
            </button>

            {/* Both gates applied: ref lock + UI state */}
            <button
              disabled={disabled || sending || isSendingRef.current}
              onClick={handleSend}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-md transition-all active:scale-95"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send AI Reminder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800 animate-fade-in">
            ✓ Reminder queued successfully! Check chat history below.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Reminder Schedule</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold dark:text-white">Enable Auto-Reminders</p>
                  <p className="text-xs text-gray-500">AI will automatically follow up</p>
                </div>
                <input
                  type="checkbox"
                  checked={reminderSettings.enabled}
                  onChange={(e) => updateSetting('enabled', e.target.checked)}
                  className="w-10 h-5 bg-gray-200 rounded-full appearance-none cursor-pointer checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 after:transition-all checked:after:translate-x-5"
                />
              </div>

              <div className={!reminderSettings.enabled ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Frequency</label>
                <select
                  value={reminderSettings.interval}
                  onChange={(e) => updateSetting('interval', parseInt(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value={3}>Every 3 days</option>
                  <option value={7}>Weekly</option>
                  <option value={14}>Every 2 weeks</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
