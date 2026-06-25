import { useState } from "react";
import { createDebt } from "../../services/debtService";

export default function AddDebtModal({ isOpen, onClose, debtorId, debtorName, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: "",
    dueDate: "",
    debtType: "ONE_TIME",
    creditorName: "",
    creditorType: "COMPANY", // Defaulting to company, can be "PERSON" or "COMPANY"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setLoading(true);

    try {
      // Validate
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError("Please enter a valid amount");
        setLoading(false);
        return;
      }

      if (!formData.dueDate) {
        setError("Please select a due date");
        setLoading(false);
        return;
      }

      if (!formData.creditorName.trim()) {
        setError("Please enter who this debt is owed to");
        setLoading(false);
        return;
      }

      // Check if due date is in the past and show warning
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        console.log("Setting a past due date:", formData.dueDate);
      }

      await createDebt({
        debtorId,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        debtType: formData.debtType,
        creditorName: formData.creditorName.trim(),
        creditorType: formData.creditorType,
      });

      // Reset form and notify parent
      setFormData({ amount: "", dueDate: "", debtType: "ONE_TIME", creditorName: "", creditorType: "COMPANY" });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error creating debt:", err);
      setError(err.response?.data?.message || "Failed to create debt");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if due date is in the past
    if (name === "dueDate" && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setWarning("Note: This due date is in the past. The debt will be marked as overdue.");
      } else {
        setWarning(null);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl dark:shadow-none dark:border dark:border-gray-800 animate-fade-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Debt</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Record debt for {debtorName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-4">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Record the amount owed, who it's owed to, and when it's due.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl animate-shake">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Creditor Details Field (NEW) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owed To <span className="text-red-500 dark:text-red-400">*</span>
                </label>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, creditorType: "COMPANY" }))}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.creditorType === "COMPANY"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    disabled={loading}
                  >
                    <span className="text-lg">🏢</span>
                    <span className="font-medium text-sm">Company</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, creditorType: "PERSON" }))}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.creditorType === "PERSON"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    disabled={loading}
                  >
                    <span className="text-lg">👤</span>
                    <span className="font-medium text-sm">Person</span>
                  </button>
                </div>

                <input
                  type="text"
                  name="creditorName"
                  value={formData.creditorName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={formData.creditorType === 'COMPANY' ? "e.g., DCS  Company Limited" : "e.g., John Doe"}
                  disabled={loading}
                />
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount Owed <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                    KES
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none transition-all duration-200 text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Due Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark]"
                  disabled={loading}
                />

                {warning && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3 flex items-start gap-2 mt-2">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">{warning}</p>
                  </div>
                )}
              </div>

              {/* Debt Type Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, debtType: "ONE_TIME" }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.debtType === "ONE_TIME"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    disabled={loading}
                  >
                    <div className="text-2xl mb-1">💰</div>
                    <div className="font-medium text-sm">One-Time</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Single payment</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, debtType: "INSTALLMENT" }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.debtType === "INSTALLMENT"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    disabled={loading}
                  >
                    <div className="text-2xl mb-1">📅</div>
                    <div className="font-medium text-sm">Installment</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Multiple payments</div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 active:scale-[0.98] transition-all duration-200 font-medium shadow-md hover:shadow-lg dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Add Debt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
