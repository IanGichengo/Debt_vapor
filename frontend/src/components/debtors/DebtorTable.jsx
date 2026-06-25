import { useEffect, useState } from "react";
import { getDebtors } from "../../services/debtorService";
import {
  getDebtsSummaryForAllDebtors,
  calculateDebtorStatus,
  calculateDebtStats
} from "../../services/debtService";
import { Link } from "react-router-dom";

export default function DebtorTable({ refreshKey }) {
  const [debtors, setDebtors] = useState([]);
  const [debtorsWithStatus, setDebtorsWithStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    const fetchDebtorsWithStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const debtorsData = await getDebtors();
        setDebtors(debtorsData);

        const debtorIds = debtorsData.map(d => d.id);
        const debtsByDebtorId = await getDebtsSummaryForAllDebtors(debtorIds);

        const debtorsWithDetails = debtorsData.map(debtor => {
          const debts = debtsByDebtorId[debtor.id] || [];
          const statusInfo = calculateDebtorStatus(debts);
          const stats = calculateDebtStats(debts);

          return {
            ...debtor,
            calculatedStatus: statusInfo.status,
            statusColor: statusInfo.color,
            dotColor: statusInfo.dotColor,
            totalDebt: stats.totalDebt,
            totalPaid: stats.totalPaid,
            balance: stats.balance,
            debtCount: stats.debtCount,
            paidCount: stats.paidCount,
            overdueCount: stats.overdueCount,
            upcomingCount: stats.upcomingCount
          };
        });

        setDebtorsWithStatus(debtorsWithDetails);
        const total = debtorsWithDetails.reduce((sum, debtor) => sum + debtor.balance, 0);
        setTotalOutstanding(total);
      } catch (err) {
        console.error("Failed to fetch debtors with status:", err);
        setError(err.message || "Failed to load debtors");
      } finally {
        setLoading(false);
      }
    };

    fetchDebtorsWithStatus();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 dark:border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-200 font-medium">Loading debtors</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Fetching your debtor records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Debtors</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (debtors.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-blue-400 dark:text-blue-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Debtors Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Debtors will appear here once added to the system.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Debtors</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {debtorsWithStatus.length} {debtorsWithStatus.length === 1 ? 'debtor' : 'debtors'}
            </span>
            Total outstanding: <span className="font-semibold text-gray-900 dark:text-white">Ksh {totalOutstanding.toLocaleString()}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
              ({debtorsWithStatus.filter(d => d.balance > 0).length} with active debt)
            </span>
          </p>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Debt Info</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {debtorsWithStatus.map((debtor) => (
              <tr
                key={debtor.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      debtor.balance > 0
                        ? "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
                        : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                    }`}>
                      <span className={`font-semibold text-sm ${
                        debtor.balance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                      }`}>
                        {debtor.name?.charAt(0).toUpperCase() || 'D'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {debtor.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          ID: {debtor.id?.substring(0, 8)}...
                        </p>
                        {debtor.debtCount > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {debtor.debtCount} debt{debtor.debtCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{debtor.phone || '—'}</span>
                    </div>
                    {debtor.email && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{debtor.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    {debtor.debtCount > 0 ? (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Total:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-200">KES {debtor.totalDebt?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Paid:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">KES {debtor.totalPaid?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Bal:</span>
                          <span className={`font-medium ${debtor.balance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                            KES {debtor.balance?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">No debts recorded</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${debtor.dotColor}`}></div>
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${debtor.statusColor}`}>
                      {debtor.calculatedStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  {debtor.balance > 0 && (
                     <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {debtor.balance.toLocaleString()} KES left
                    </p>
                  )}
                </td>
                <td className="px-6 py-5">
                  <Link
                    to={`/dashboard/debtors/${debtor.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 transition-all duration-200"
                  >
                    <span>💼</span>
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Showing {debtorsWithStatus.length} debtors</span>
            <div className="hidden sm:flex items-center gap-3 border-l dark:border-gray-700 pl-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Overdue: {debtorsWithStatus.filter(d => d.calculatedStatus === "Overdue").length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Paid: {debtorsWithStatus.filter(d => d.calculatedStatus === "Fully Paid").length}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
