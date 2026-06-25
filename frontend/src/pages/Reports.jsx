import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getDashboardStats } from "../services/debtService";
import {
  TrendingUp,
  Download,
  Users,
  DollarSign,
  AlertTriangle,
  FileText,
  Printer,
  Target,
  Award,
  FileBarChart,
  Trophy,
  ChartBar,
  CheckCircle,
  Clock,
  Activity,
  Zap,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_REFRESH_MS = 60_000;

const EMPTY_STATS = {
  totalDebtors: 0,
  totalDebts: 0,
  totalOutstanding: 0,
  totalPaid: 0,
  activeDebts: 0,
  overdueDebts: 0,
  upcomingDebts: 0,
  paidDebts: 0,
  averageDebtAmount: 0,
  recoveryRate: 0,
  recentPayments: [],
  topDebtors: [],
  debtStatusDistribution: [],
  totalPayments: 0,
  todayPayments: 0,
  weekPayments: 0,
  monthPayments: 0,
  newDebtorsThisMonth: null,
};

const STATUS_COLORS = {
  Active: "bg-blue-500",
  Overdue: "bg-red-500",
  Paid: "bg-emerald-500",
  Upcoming: "bg-amber-500",
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompact(amount) {
  if (amount >= 1_000_000) return `Ksh ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Ksh ${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function statusColor(item) {
  return item.color ?? STATUS_COLORS[item.status] ?? "bg-gray-400";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, accent, badge }) {
  const accents = {
    blue: {
      icon: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      badge: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    },
    red: {
      icon: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    },
    emerald: {
      icon: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    },
    purple: {
      icon: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      badge: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    },
  };
  const c = accents[accent] ?? accents.blue;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.badge}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
          {sub}
        </p>
      )}
    </div>
  );
}

function ProgressRow({ label, value, colorClass }) {
  const pct = Math.min(Math.round(value), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reports() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  // Brief green flash when auto-refresh fires
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (silent = false) => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
      if (silent) {
        setPulse(true);
        setTimeout(() => setPulse(false), 1200);
      }
    } catch (err) {
      console.error("Failed to fetch report data:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData(false);
      setLoading(false);
    })();
  }, [fetchData]);

  // Auto-refresh — no manual button
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchData(true), AUTO_REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  // ── Derived values (honest — no fabricated padding) ────────────────────────

  const successRate =
    stats.totalDebts > 0
      ? Math.round((stats.paidDebts / stats.totalDebts) * 100)
      : 0;

  const recoveryRate = stats.recoveryRate ?? 0;

  const collectionEfficiency =
    stats.totalOutstanding + stats.totalPaid > 0
      ? Math.round(
          (stats.totalPaid / (stats.totalOutstanding + stats.totalPaid)) * 100
        )
      : 0;

  const maxPayment = Math.max(
    ...stats.recentPayments.map((p) => p.amount),
    1
  );

  const getBarPct = (amount) => {
    if (!amount) return 0;
    return Math.max(4, (amount / maxPayment) * 100);
  };

  const weekTotal = stats.recentPayments.reduce((s, d) => s + d.amount, 0);

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = [
        ["Report Generated", new Date().toLocaleDateString()],
        ["Generated By", user?.name ?? "Unknown"],
        [],
        ["Metric", "Value"],
        ["Total Debtors", stats.totalDebtors],
        ["Total Outstanding", formatCurrency(stats.totalOutstanding)],
        ["Total Recovered", formatCurrency(stats.totalPaid)],
        ["Active Debts", stats.activeDebts],
        ["Overdue Debts", stats.overdueDebts],
        ["Upcoming Debts", stats.upcomingDebts],
        ["Recovery Rate", `${recoveryRate}%`],
        ["Success Rate", `${successRate}%`],
        ["Collection Efficiency", `${collectionEfficiency}%`],
        ["Payments Today", stats.todayPayments ?? 0],
        ["Payments This Week", stats.weekPayments ?? 0],
        ["Payments This Month", stats.monthPayments ?? 0],
        ["All-Time Payments", stats.totalPayments ?? 0],
        [],
        ["Status", "Count", "%"],
        ...stats.debtStatusDistribution.map((item) => [
          item.status,
          item.count,
          stats.totalDebts > 0
            ? `${Math.round((item.count / stats.totalDebts) * 100)}%`
            : "0%",
        ]),
        [],
        ["Debtor", "Balance", "Debts", "Status"],
        ...stats.topDebtors.map((d) => [
          d.name,
          formatCurrency(d.totalBalance ?? 0),
          d.debtCount,
          d.isOverdue ? "Overdue" : "Active",
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");

      const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-14 h-14 border-2 border-gray-200 dark:border-gray-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-gray-900 dark:border-white rounded-full animate-spin border-t-transparent" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Loading report data…
          </p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Sticky top bar ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Left: title + live indicator */}
          <div className="flex items-center gap-3">
            <FileBarChart className="w-5 h-5 text-gray-400" />
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                Analytics & Reports
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-500 ${
                    pulse ? "bg-emerald-300" : "bg-emerald-500"
                  }`}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Auto-refresh every 60s · last updated{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total debtors"
            value={stats.totalDebtors}
            icon={Users}
            accent="blue"
            badge={
              stats.newDebtorsThisMonth != null
                ? `+${stats.newDebtorsThisMonth} this month`
                : `${stats.activeDebts} active`
            }
            sub={`${stats.totalDebts} total debt records`}
          />
          <KpiCard
            label="Total outstanding"
            value={formatCompact(stats.totalOutstanding)}
            icon={DollarSign}
            accent="red"
            badge={`${stats.overdueDebts} overdue`}
            sub={`${formatCompact(stats.totalPaid)} collected to date`}
          />
          <KpiCard
            label="Total recovered"
            value={formatCompact(stats.totalPaid)}
            icon={TrendingUp}
            accent="emerald"
            badge={`${recoveryRate}% rate`}
            sub={`${stats.paidDebts} debt${stats.paidDebts !== 1 ? "s" : ""} settled`}
          />
          <KpiCard
            label="Success rate"
            value={`${successRate}%`}
            icon={Target}
            accent="purple"
            badge={
              successRate >= 70
                ? "High efficiency"
                : successRate >= 40
                ? "Medium efficiency"
                : "Needs attention"
            }
            sub={`${collectionEfficiency}% collection efficiency`}
          />
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Payment activity — spans 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Payment activity
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Last {stats.recentPayments.length} days
                </p>
              </div>
              {weekTotal > 0 && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                    {formatCompact(weekTotal)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">week total</p>
                </div>
              )}
            </div>

            {stats.recentPayments.length > 0 ? (
              <>
                <div className="flex items-end gap-2 h-44">
                  {stats.recentPayments.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
                        {day.amount > 0 ? (
                          <div className="relative group w-full">
                            <div
                              className="w-full bg-gray-900 dark:bg-white rounded-sm hover:bg-gray-600 dark:hover:bg-gray-300 cursor-default transition-colors"
                              style={{ height: `${getBarPct(day.amount)}%`, minHeight: 4 }}
                            />
                            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-lg">
                              <p className="font-medium">{formatCompact(day.amount)}</p>
                              <p className="text-gray-400">
                                {day.count} payment{day.count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-sm"
                            style={{ height: 4 }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                        {formatDate(day.date)}
                      </p>
                    </div>
                  ))}
                </div>

                {(stats.weekPayments > 0 || stats.todayPayments > 0) && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-4">
                    {[
                      { label: "Today", value: stats.todayPayments ?? 0 },
                      { label: "This week", value: stats.weekPayments ?? 0 },
                      { label: "This month", value: stats.monthPayments ?? 0 },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{s.label}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                          {s.value}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">payments</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-44 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto">
                    <ChartBar className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No payment data yet
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Debt status distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Debt status
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {stats.totalDebts} total tracked
              </p>
            </div>

            {stats.debtStatusDistribution.length > 0 ? (
              <div className="space-y-4">
                {stats.debtStatusDistribution.map((item, i) => {
                  const pct =
                    stats.totalDebts > 0
                      ? Math.round((item.count / stats.totalDebts) * 100)
                      : 0;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(item)}`}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                            {item.count}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${statusColor(item)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Stacked summary bar — flex, no float */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-1.5 w-full rounded-full overflow-hidden flex">
                    {stats.debtStatusDistribution.map((item, i) => {
                      const pct =
                        stats.totalDebts > 0
                          ? (item.count / stats.totalDebts) * 100
                          : 0;
                      return (
                        <div
                          key={i}
                          className={`h-full ${statusColor(item)}`}
                          style={{ width: `${pct}%` }}
                          title={`${item.status}: ${pct.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Performance + Payment volumes ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Performance
              </h2>
            </div>
            <div className="space-y-4">
              <ProgressRow
                label="Recovery rate"
                value={recoveryRate}
                colorClass="bg-emerald-500"
              />
              <ProgressRow
                label="Success rate"
                value={successRate}
                colorClass="bg-blue-500"
              />
              <ProgressRow
                label="Collection efficiency"
                value={collectionEfficiency}
                colorClass="bg-purple-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Payment volumes
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Today", value: stats.todayPayments ?? 0 },
                { label: "This week", value: stats.weekPayments ?? 0 },
                { label: "This month", value: stats.monthPayments ?? 0 },
                { label: "All time", value: stats.totalPayments ?? 0 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                >
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    {s.label}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">payments</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Top debtors table ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Top debtors by balance
              </h2>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {stats.topDebtors.length} shown
            </span>
          </div>

          {stats.topDebtors.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.topDebtors.map((debtor, i) => (
                <div
                  key={debtor.id ?? i}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold ${
                          debtor.isOverdue
                            ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {(debtor.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      {i < 3 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {debtor.name ?? `Debtor ${i + 1}`}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {debtor.phone ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                        {formatCompact(debtor.totalBalance ?? 0)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {debtor.debtCount ?? 0} debt
                        {debtor.debtCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {debtor.isOverdue ? (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No debtors found
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Generated{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{user?.name ?? "System"} · data is encrypted and protected</span>
          </div>
        </div>

      </div>
    </div>
  );
}
