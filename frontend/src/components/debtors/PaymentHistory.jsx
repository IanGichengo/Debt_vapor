import { getDebtorById } from "../../services/debtorService";
import { useEffect, useState } from "react";

export default function PaymentHistory({ debtorId }) {
  const [debtor, setDebtor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebtor = async () => {
      try {
        const data = await getDebtorById(debtorId);
        setDebtor(data);
      } catch (error) {
        console.error("Failed to fetch debtor:", error);
        setDebtor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDebtor();
  }, [debtorId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border dark:border-gray-800 p-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (!debtor) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border dark:border-gray-800 p-6 mt-6">
        <p className="text-red-500 dark:text-red-400">Unable to load debtor data.</p>
      </div>
    );
  }

  const payments = debtor.payments || [];
  const debts = debtor.debts || [];

  // Calculate totals
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const totalPaid = debts.reduce((sum, d) => sum + Number(d.amountPaid || 0), 0);
  const balance = totalDebt - totalPaid;

  // Format payment date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get payment method icon
  const getMethodIcon = (method) => {
    switch (method) {
      case "M-PESA":
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        );
      case "CASH":
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "BANK_TRANSFER":
        return (
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border dark:border-gray-800 p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Payment History
        </h2>
        {payments.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {payments.length} {payments.length === 1 ? "payment" : "payments"}
          </span>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No payments recorded yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Payment history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getMethodIcon(payment.method)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      KES {Number(payment.amount).toLocaleString()}
                    </p>
                    {payment.status === "COMPLETED" && (
                      <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{payment.method}</span>
                    <span>•</span>
                    <span>{formatDate(payment.paymentDate)}</span>
                    {payment.receiptNumber && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px]">
                          {payment.receiptNumber}
                        </span>
                      </>
                    )}
                  </div>
                  {payment.debt && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      Applied to debt: KES {Number(payment.debt.amount).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Total Debt</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            KES {totalDebt.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Total Paid</span>
          <span className="font-semibold text-green-700 dark:text-green-400">
            KES {totalPaid.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-base pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-gray-700 dark:text-gray-300 font-semibold">Outstanding Balance</span>
          <span
            className={`font-bold text-lg ${
              balance <= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            KES {Math.max(balance, 0).toLocaleString()}
          </span>
        </div>
        {balance <= 0 && totalPaid > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All debts have been paid! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
