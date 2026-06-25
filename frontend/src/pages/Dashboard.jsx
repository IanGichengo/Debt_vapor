import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getDashboardStats } from "../services/debtService";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { Link } from "react-router-dom";
import AddDebtorModal from "../components/debtors/AddDebtorModal";
import {
  TrendingUp, Users, DollarSign, FileText, CheckCircle,
  ArrowUpRight, ArrowDownRight, ChevronRight, Percent,
  LineChart, Home, AlertTriangle, Sparkles, TrendingDown,
  Trophy, ChartBar, Activity as ActivityIcon,
  Bell, BellRing, CreditCard, PieChart,
} from "lucide-react";

// ─── Utilities (shared / extractable) ───────────────────────────────────────

export function formatCurrency(amount, compact = false) {
  if (compact) {
    if (amount >= 1_000_000) return `Ksh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `Ksh ${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-KE", {
    style: "currency", currency: "KES",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return { label: "Morning",   emoji: "☀️" };
  if (h < 17) return { label: "Afternoon", emoji: "🌤️" };
  return           { label: "Evening",   emoji: "🌙" };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AUTO_REFRESH_MS = 60_000; // refresh every 60 s

const EMPTY_STATS = {
  totalDebtors: 0, totalDebts: 0, totalOutstanding: 0, totalPaid: 0,
  activeDebts: 0, overdueDebts: 0, upcomingDebts: 0, paidDebts: 0,
  averageDebtAmount: 0,
  recoveryRate: null,          // guarded — backend may not supply this
  recentPayments: [],
  debtStatusDistribution: [], topDebtors: [],
  totalPayments: 0, todayPayments: 0, weekPayments: 0, monthPayments: 0,
  newDebtorsThisMonth: null,   // guarded — backend may not supply this
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuthContext();
  const [dashboardStats, setDashboardStats] = useState(EMPTY_STATS);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showAddDebtorModal, setShowAddDebtorModal] = useState(false);

  const {
    notificationCount: unreadNotifications,
    refreshCount: refreshNotificationCount,
  } = useNotificationCount();

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setDashboardStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    })();
  }, [fetchDashboardData]);

  // Auto-refresh every 60 s
  useEffect(() => {
    const id = setInterval(async () => {
      await fetchDashboardData();
      await refreshNotificationCount();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchDashboardData, refreshNotificationCount]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddNewDebtor = () => setShowAddDebtorModal(true);
  const handleDebtorAdded  = () => fetchDashboardData();

  // ── Derived values ─────────────────────────────────────────────────────────

  const successRate = dashboardStats.totalDebts > 0
    ? Math.round((dashboardStats.paidDebts / dashboardStats.totalDebts) * 100)
    : 0;

  const recoveryRate = dashboardStats.recoveryRate ?? 0;

  const paymentCount = dashboardStats.recentPayments.length;
  const weekTotal    = dashboardStats.recentPayments.reduce((s, d) => s + d.amount, 0);
  const dailyAvg     = paymentCount > 0 ? weekTotal / paymentCount : 0;

  const maxPaymentAmount = Math.max(
    ...dashboardStats.recentPayments.map((p) => p.amount),
    1,
  );

  const getBarHeight = (amount) => {
    if (!amount || amount === 0) return 0;
    return Math.max(4, (amount / maxPaymentAmount) * 100);
  };

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  const { label: timeLabel, emoji: timeEmoji } = getTimeOfDay();

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-blue-100 dark:border-blue-900 rounded-full" />
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 dark:border-blue-400 rounded-full animate-spin border-t-transparent" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Gathering financial insights…
          </p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

        {/* ── Top Navigation Bar ── */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">

            {/* Left — month */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentMonth}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ActivityIcon className="w-3 h-3" />
                  Live data · Updated{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Right — notification bell only */}
            <Link
              to="/dashboard/notifications"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              {unreadNotifications > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{unreadNotifications}</span>
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </Link>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">

            {/* ── Welcome + Quick Insights ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Welcome card */}
              <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                          Good {timeLabel}{timeEmoji}
                          {user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                        </h1>
                        <p className="text-blue-100 text-base">
                          Financial Dashboard · {currentMonth}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                        <p className="text-xs text-blue-200 mb-1">Recovery Rate</p>
                        <p className="text-xl font-bold">{recoveryRate}%</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                        <p className="text-xs text-blue-200 mb-1">Active Debts</p>
                        <p className="text-xl font-bold">{dashboardStats.activeDebts}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                        <p className="text-xs text-blue-200 mb-1">Avg. Debt</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(dashboardStats.averageDebtAmount, true)}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                        <p className="text-xs text-blue-200 mb-1">Success Rate</p>
                        <p className="text-xl font-bold">{successRate}%</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/dashboard/debtors"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium group whitespace-nowrap"
                  >
                    <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    View All Debtors
                  </Link>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Insights
                  </h2>
                  <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Collections Today
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dashboardStats.todayPayments > 0
                            ? `${dashboardStats.todayPayments} payment${dashboardStats.todayPayments > 1 ? "s" : ""}`
                            : "No payments yet"}
                        </p>
                      </div>
                    </div>
                    {dashboardStats.todayPayments > 0
                      ? <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-green-400" />
                      : <TrendingDown className="w-4 h-4 text-gray-400" />}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Overdue Debts
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dashboardStats.overdueDebts} cases
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard/debtors?filter=overdue"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                    >
                      View
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Completed
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dashboardStats.paidDebts} debts
                        </p>
                      </div>
                    </div>
                    <Percent className="w-4 h-4 text-green-500 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Main Stats Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <StatCard
                title="Total Debtors"
                value={dashboardStats.totalDebtors}
                change={
                  dashboardStats.newDebtorsThisMonth != null
                    ? `+${dashboardStats.newDebtorsThisMonth} this month`
                    : `${dashboardStats.totalDebts} total debts`
                }
                trend={dashboardStats.totalDebtors > 0 ? "up" : "neutral"}
                icon={<Users className="w-6 h-6" />}
                color="blue"
                detail="Active debtors in system"
                metric={`${dashboardStats.totalDebts} total debts`}
              />
              <StatCard
                title="Outstanding Balance"
                value={formatCurrency(dashboardStats.totalOutstanding, true)}
                change={`${dashboardStats.overdueDebts} overdue cases`}
                trend={dashboardStats.overdueDebts > 0 ? "warning" : "neutral"}
                icon={<DollarSign className="w-6 h-6" />}
                color="red"
                detail="Total amount pending"
                metric={`${formatCurrency(dashboardStats.totalPaid, true)} collected`}
              />
              <StatCard
                title="Active Debts"
                value={dashboardStats.activeDebts}
                change={`${dashboardStats.upcomingDebts} due soon`}
                trend="neutral"
                icon={<FileText className="w-6 h-6" />}
                color="orange"
                detail="Currently active cases"
                metric={`${dashboardStats.overdueDebts} require attention`}
              />
              <StatCard
                title="Recovery Rate"
                value={`${recoveryRate}%`}
                change={`${dashboardStats.totalPayments} total payments`}
                trend={recoveryRate > 50 ? "up" : "down"}
                icon={<TrendingUp className="w-6 h-6" />}
                color="green"
                detail="Collection efficiency"
                metric={`${dashboardStats.paidDebts} debts settled`}
              />
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-4 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap mr-2">
                  Quick Actions
                </p>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleAddNewDebtor}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transition-all duration-200 font-medium text-sm"
                  >
                    <Users className="w-4 h-4" />
                    Add New Debtor
                  </button>

                  <Link
                    to="/dashboard/payments"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    Record Payment
                  </Link>

                  <Link
                    to="/dashboard/notifications"
                    className="relative flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-orange-400 dark:hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm"
                  >
                    <BellRing className="w-4 h-4" />
                    View Notifications
                    {unreadNotifications > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Payment Activity */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Payment Activity
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Last {paymentCount} days collection trends
                    </p>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dashboardStats.weekPayments} payments
                  </span>
                </div>

                {dashboardStats.recentPayments.length > 0 ? (
                  <>
                    <div className="h-64 flex items-end gap-2 pt-8">
                      {dashboardStats.recentPayments.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
                            {day.amount > 0 ? (
                              <div
                                className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer group relative"
                                style={{ height: `${getBarHeight(day.amount)}%` }}
                              >
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10 shadow-lg">
                                  <div className="font-semibold">{formatCurrency(day.amount, true)}</div>
                                  <div className="text-gray-300">{day.count} payment{day.count > 1 ? "s" : ""}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-600 rounded" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            {formatDate(day.date)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {day.count > 0 ? day.count : "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Week Total</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(weekTotal, true)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(dailyAvg, true)}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/dashboard/payments"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center justify-center gap-1 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        View all payments <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChartBar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">No payment data available</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        Payments will appear here once recorded
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Debt Status */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Debt Status</h2>
                  <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-4">
                  {dashboardStats.debtStatusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.count}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dashboardStats.totalDebts > 0
                            ? Math.round((item.count / dashboardStats.totalDebts) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    {dashboardStats.debtStatusDistribution.map((item, index) => {
                      const pct = dashboardStats.totalDebts > 0
                        ? (item.count / dashboardStats.totalDebts) * 100
                        : 0;
                      return (
                        <div
                          key={index}
                          className={item.color}
                          style={{ width: `${pct}%` }}
                          title={`${item.status}: ${pct.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Debts Tracked</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.totalDebts}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Top Debtors ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Top Debtors by Balance
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Debtors with highest outstanding amounts
                  </p>
                </div>
                <Link
                  to="/dashboard/debtors"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  View All
                </Link>
              </div>

              {dashboardStats.topDebtors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardStats.topDebtors.map((debtor, index) => (
                    // FIX: each row now links through to the debtor's profile
                    <Link
                      key={debtor.id}
                      to={`/dashboard/debtors/${debtor.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            debtor.isOverdue
                              ? "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800"
                              : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800"
                          } group-hover:scale-105 transition-transform`}
                        >
                          <span className={`font-semibold text-sm ${debtor.isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                            {debtor.name.charAt(0)}
                          </span>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{debtor.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{debtor.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(debtor.totalBalance, true)}
                        </p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {debtor.debtCount} debt{debtor.debtCount !== 1 ? "s" : ""}
                          </span>
                          {debtor.isOverdue && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              ⚠️ Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No outstanding debts</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    All debts are paid or no debtors found
                  </p>
                  <button
                    onClick={handleAddNewDebtor}
                    className="inline-block mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-sm"
                  >
                    Add a debtor to get started →
                  </button>
                </div>
              )}
            </div>

            {/* ── Footer Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Payments",
                  value: dashboardStats.totalPayments || 0,
                  sub: "All time",
                },
                {
                  label: "This Week",
                  value: dashboardStats.weekPayments || 0,
                  sub: "Payments received",
                },
                {
                  label: "This Month",
                  value: dashboardStats.monthPayments || 0,
                  sub: "Payments received",
                },
                {
                  label: "Avg. Collection Time",
                  value: dashboardStats.avgCollectionDays != null
                    ? `${dashboardStats.avgCollectionDays}d`
                    : "—",
                  sub: "Days to settle",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-center"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <AddDebtorModal
        open={showAddDebtorModal}
        onClose={() => setShowAddDebtorModal(false)}
        onSuccess={handleDebtorAdded}
      />
    </>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

const COLOR_CLASSES = {
  blue:   "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  red:    "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  green:  "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
};

function StatCard({ title, value, change, trend, icon, color, detail, metric }) {
  const trendColor =
    trend === "up"      ? "text-green-600 dark:text-green-400"
    : trend === "down"  ? "text-red-600 dark:text-red-400"
    : trend === "warning" ? "text-yellow-600 dark:text-yellow-400"
    : "text-gray-600 dark:text-gray-400";

  const TrendIcon =
    trend === "up"      ? ArrowUpRight
    : trend === "down"  ? ArrowDownRight
    : trend === "warning" ? AlertTriangle
    : TrendingUp;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-blue-200 dark:hover:border-blue-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${COLOR_CLASSES[color]} group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium">
          <TrendIcon className={`w-3 h-3 ${trendColor}`} />
          <span className={trendColor}>{change}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {detail && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{detail}</p>}
        {metric && <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">{metric}</p>}
      </div>
    </div>
  );
}
