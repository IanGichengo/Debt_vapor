import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDebtorById, getChatHistory } from "../services/debtorService";
import { getDebtSummary, getDebtsByDebtor } from "../services/debtService";
import whatsappApi from "../services/whatsappApi";
import PaymentHistory from "../components/debtors/PaymentHistory";
import WhatsAppAction from "../components/debtors/WhatsAppAction";
import ChatHistory from "../components/debtors/ChatHistory";
import EditDebtorModal from "../components/debtors/EditDebtorModal";
import AddDebtModal from "../components/debtors/AddDebtModal";

// ── Derives the real display status of a debt based on due date ──────────────
const getDebtDisplayStatus = (debt) => {
  if (debt.amountPaid >= debt.amount) return { label: "Paid", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(debt.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) return { label: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };

  const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntilDue <= 7) return { label: "Due Soon", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };

  return { label: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
};

export default function DebtorProfile() {
  const { id } = useParams();
  const [debtor, setDebtor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [debtSummary, setDebtSummary] = useState(null);
  const [debts, setDebts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // ── Separated: pageError crashes the page, inlineError shows a banner ───────
  const [pageError, setPageError] = useState(null);
  const [inlineError, setInlineError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- HELPER FUNCTIONS ---

  const calculateDebtorStatus = (debtsArray) => {
    if (!debtsArray || debtsArray.length === 0) {
      return { status: "No Debts", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasOverdue = false;
    let hasUpcoming = false;
    let allPaid = true;

    debtsArray.forEach(debt => {
      const dueDate = new Date(debt.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (debt.amountPaid < debt.amount) allPaid = false;
      if (dueDate < today && debt.amountPaid < debt.amount) hasOverdue = true;

      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilDue >= 0 && daysUntilDue <= 7 && debt.amountPaid < debt.amount) hasUpcoming = true;
    });

    if (allPaid) return { status: "Fully Paid", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    if (hasOverdue) return { status: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (hasUpcoming) return { status: "Upcoming Payment", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { status: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  };

  const calculateDebtStats = (debtsData) => {
    if (!debtsData || debtsData.length === 0) {
      return { totalDebt: 0, totalPaid: 0, balance: 0, debtCount: 0, paidCount: 0, pendingCount: 0, overdueCount: 0, upcomingCount: 0 };
    }

    let totalDebt = 0;
    let totalPaid = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let paidCount = 0, pendingCount = 0, overdueCount = 0, upcomingCount = 0;

    debtsData.forEach((d) => {
      totalDebt += d.amount;
      totalPaid += d.amountPaid;
      const dueDate = new Date(d.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

      if (d.amountPaid >= d.amount) paidCount++;
      else if (dueDate < today) overdueCount++;
      else if (daysUntilDue <= 7 && daysUntilDue >= 0) upcomingCount++;
      else pendingCount++;
    });

    return { totalDebt, totalPaid, balance: totalDebt - totalPaid, debtCount: debtsData.length, paidCount, pendingCount, overdueCount, upcomingCount };
  };

  // --- DATA FETCHING ---

  const fetchDebtData = async () => {
    try {
      const debtsData = await getDebtsByDebtor(id);
      setDebts(debtsData);
      setDebtSummary(calculateDebtStats(debtsData));
    } catch (err) {
      console.error("Error fetching debt data:", err);
    }
  };

  const refreshChatHistory = async () => {
    try {
      const chatData = await getChatHistory(id);
      if (Array.isArray(chatData)) {
        setMessages(chatData);
      } else if (chatData && Array.isArray(chatData.data)) {
        setMessages(chatData.data);
      } else {
        setMessages([]);
      }
    } catch (chatError) {
      console.error("Error refreshing chat history:", chatError);
      setMessages([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const debtorData = await getDebtorById(id);
        setDebtor(debtorData);
        await fetchDebtData();
        await refreshChatHistory();
      } catch (err) {
        setPageError(err.message || "Failed to load debtor details"); // ← page-level only
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // --- HANDLERS ---

  const handleDebtAdded = () => fetchDebtData();

  const handleSendAIReminder = async () => {
    if (isSending) return;
    setIsSending(true);
    setSuccessMessage(null);
    setInlineError(null); // ← clears inline banner, never touches pageError

    try {
      await whatsappApi.sendAIReminderToDebtor(debtor.id);
      setSuccessMessage("Reminder sent successfully!");
      await refreshChatHistory();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      // 429 means it was already sent — show as info, not error
      if (err.response?.status === 429 || err.response?.data?.alreadySent) {
        setSuccessMessage("A reminder was already sent recently.");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const msg = err.response?.data?.message || err.message || "Failed to send reminder";
        setInlineError(msg);
        setTimeout(() => setInlineError(null), 5000);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleDebtorSave = (updatedDebtor) => {
    setDebtor(updatedDebtor);
    setEditing(false);
    setSuccessMessage("Debtor profile updated successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const statusInfo = calculateDebtorStatus(debts);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 dark:text-gray-400 ml-4">Loading debtor details...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {pageError}</p>
          <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!debtor) return <div className="p-8 text-center">Debtor not found</div>;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-200 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Inline Error Banner — never crashes the page */}
        {inlineError && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{inlineError}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold dark:text-white">{debtor.name}</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
          </div>
          <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1">
            ← Back to Debtors
          </button>
        </div>

        {/* Financial Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/40 rounded-xl border border-blue-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400">Debt Summary</h2>
            <button onClick={() => setShowAddDebt(true)} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-sm transition">
              + Add Debt
            </button>
          </div>

          {debtSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Total Owed</p>
                <p className="text-xl font-bold dark:text-white">KES {debtSummary.totalDebt.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-xl font-bold text-green-600">KES {debtSummary.totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Balance</p>
                <p className="text-xl font-bold text-red-600">KES {debtSummary.balance.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          <section>
            <h3 className="text-md font-semibold dark:text-gray-200 mb-4">Active Debts</h3>
            <div className="space-y-3">
              {debts.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No debts recorded.</p>
              )}
              {debts.map((debt) => {
                // ── Derive real status from due date, not DB field ───────────
                const displayStatus = getDebtDisplayStatus(debt);
                return (
                  <div key={debt.id} className="p-4 rounded-lg border bg-white dark:bg-gray-800/30 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-bold dark:text-white">KES {debt.amount.toLocaleString()}</p>
                        {debt.amountPaid > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Paid: KES {debt.amountPaid.toLocaleString()}
                          </p>
                        )}
                        {debt.creditorName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Owed to: {debt.creditorName}</p>
                        )}
                        <p className="text-xs text-gray-500">Due: {new Date(debt.dueDate).toLocaleDateString()}</p>
                      </div>
                      {/* ── Colored status badge derived from due date ── */}
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${displayStatus.color}`}>
                        {displayStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <PaymentHistory debtorId={debtor.id} />

          <hr className="dark:border-gray-800" />

          <WhatsAppAction
            debtorId={debtor.id}
            debtorPhone={debtor.phone}
            onSend={handleSendAIReminder}
            disabled={!debtor.phone || isSending}
          />

          <section>
            <h2 className="text-lg font-semibold mb-3 dark:text-white">Conversation History</h2>
            {messages.length > 0
              ? <ChatHistory messages={messages} />
              : <p className="text-sm text-gray-500">No chat history.</p>
            }
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
            Edit Profile
          </button>
          <span className="text-[10px] text-gray-400 uppercase">ID: {id}</span>
        </div>
      </div>

      {/* Modals */}
      {editing && <EditDebtorModal debtor={debtor} onClose={() => setEditing(false)} onSave={handleDebtorSave} />}
      <AddDebtModal isOpen={showAddDebt} onClose={() => setShowAddDebt(false)} debtorId={debtor.id} debtorName={debtor.name} onSuccess={handleDebtAdded} />
    </div>
  );
}
