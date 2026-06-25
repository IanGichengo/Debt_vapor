import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getNotifications } from "../services/notificationService";
import {
  markNotificationAsRead as markAsReadApi,
  markAllNotificationsAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
  clearAllNotifications as clearAllApi,
} from "../services/notificationApi";
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  CheckCheck,
  Trash2,
  Search,
  X,
  Activity as ActivityIcon,
  Eye,
  BellOff,
  Settings,
  ExternalLink,
  Award,
  UserPlus,
  Database,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_REFRESH_MS = 5 * 60_000;

const FILTER_DEFS = [
  { id: "all",         label: "All",          Icon: BellRing      },
  { id: "alert",       label: "Alerts",       Icon: AlertTriangle },
  { id: "payment",     label: "Payments",     Icon: DollarSign    },
  { id: "debtor",      label: "Debtors",      Icon: Users         },
  { id: "achievement", label: "Achievements", Icon: Award         },
  { id: "system",      label: "System",       Icon: ActivityIcon  },
];

const TYPE_META = {
  alert:       { iconColor: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",           badge: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"           },
  payment:     { iconColor: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
  debtor:      { iconColor: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",       badge: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"       },
  achievement: { iconColor: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", badge: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
  system:      { iconColor: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",         badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"         },
  reminder:    { iconColor: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",   badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"   },
  summary:     { iconColor: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" },
};

const PRIORITY_BADGE = {
  high:   "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  medium: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  low:    "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const ICON_FOR_TYPE = {
  alert:       AlertTriangle,
  payment:     DollarSign,
  debtor:      Users,
  achievement: Award,
  system:      ActivityIcon,
  reminder:    Calendar,
  summary:     BarChart3,
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function getTimeAgo(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1)  return "Just now";
  if (mins < 60) return mins + "m ago";
  if (hrs < 24)  return hrs + "h ago";
  if (days === 1) return "Yesterday";
  if (days < 7)  return days + "d ago";
  return new Date(timestamp).toLocaleDateString();
}

function generateSampleNotifications() {
  const now = Date.now();
  return [
    {
      id: "1", type: "payment", title: "Payment received",
      message: "KES 25,000 payment received from John Mwangi for invoice #INV-2024-001",
      timestamp: new Date(now - 1_800_000), read: false, icon: DollarSign,
      action: "/dashboard/payments", priority: "high",
    },
    {
      id: "2", type: "alert", title: "Overdue payment",
      message: "Sarah Kamau's payment of KES 15,000 is 5 days overdue",
      timestamp: new Date(now - 7_200_000), read: false, icon: AlertTriangle,
      action: "/dashboard/debtors/123", priority: "high",
    },
    {
      id: "3", type: "debtor", title: "New debtor added",
      message: "Peter Ochieng was added to the system with initial debt of KES 50,000",
      timestamp: new Date(now - 86_400_000), read: true, icon: UserPlus,
      action: "/dashboard/debtors/456", priority: "medium",
    },
  ];
}

// ─── NotifIcon ────────────────────────────────────────────────────────────────

function NotifIcon({ type, IconOverride }) {
  const meta = TYPE_META[type] ?? TYPE_META.system;
  const Icon = IconOverride ?? ICON_FOR_TYPE[type] ?? Bell;
  return (
    <div className={"p-2.5 rounded-xl flex-shrink-0 " + meta.iconColor}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Notifications() {
  const { user } = useAuthContext();
  const [loading, setLoading]             = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter]   = useState("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [lastUpdated, setLastUpdated]     = useState(new Date());
  const [pulse, setPulse]                 = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────

  const unreadCount = notifications.filter(function(n) { return !n.read; }).length;

  function countOf(type) {
    if (type === "all") return notifications.length;
    return notifications.filter(function(n) { return n.type === type; }).length;
  }

  const todayCount = notifications.filter(function(n) {
    return new Date(n.timestamp).toDateString() === new Date().toDateString();
  }).length;

  const readRate = notifications.length > 0
    ? Math.round(((notifications.length - unreadCount) / notifications.length) * 100)
    : 100;

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async function(silent) {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setLastUpdated(new Date());
      if (silent) {
        setPulse(true);
        setTimeout(function() { setPulse(false); }, 1200);
      }
    } catch (err) {
      setNotifications(generateSampleNotifications());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() {
    fetchData(false);
    const id = setInterval(function() { fetchData(true); }, AUTO_REFRESH_MS);
    return function() { clearInterval(id); };
  }, [fetchData]);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function markAsRead(id) {
    setNotifications(function(prev) {
      return prev.map(function(n) { return n.id === id ? Object.assign({}, n, { read: true }) : n; });
    });
    try { await markAsReadApi(id); }
    catch (err) { await fetchData(false); }
  }

  async function markAllAsRead() {
    const unread = notifications.filter(function(n) { return !n.read; });
    if (!unread.length) return;
    setNotifications(function(prev) {
      return prev.map(function(n) { return Object.assign({}, n, { read: true }); });
    });
    try { await markAllAsReadApi(unread.map(function(n) { return n.id; })); }
    catch (err) { await fetchData(false); }
  }

  async function deleteNotification(id) {
    setNotifications(function(prev) { return prev.filter(function(n) { return n.id !== id; }); });
    try { await deleteNotificationApi(id); }
    catch (err) { await fetchData(false); }
  }

  async function clearAll() {
    setNotifications([]);
    try { await clearAllApi(); }
    catch (err) { await fetchData(false); }
  }

  // ── Filtered & sorted list ────────────────────────────────────────────────

  const priorityRank = { high: 3, medium: 2, low: 1 };

  const filtered = notifications
    .filter(function(n) { return activeFilter === "all" || n.type === activeFilter; })
    .filter(function(n) {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    })
    .slice()
    .sort(function(a, b) {
      if (a.read !== b.read) return a.read ? 1 : -1;
      const pa = priorityRank[a.priority] ?? 0;
      const pb = priorityRank[b.priority] ?? 0;
      if (pa !== pb) return pb - pa;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-14 h-14 border-2 border-gray-200 dark:border-gray-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-gray-900 dark:border-white rounded-full animate-spin border-t-transparent" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading notifications…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Sticky top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-400" />
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                Notifications
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={
                  "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-500 " +
                  (pulse ? "bg-emerald-300" : "bg-emerald-500")
                } />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {unreadCount > 0 ? unreadCount + " unread · " : ""}
                  Auto-refresh every 5m · last updated{" "}
                  {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/settings#notifications"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>

            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Summary KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total",   value: notifications.length, Icon: Bell,          accent: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"     },
            { label: "Unread",  value: unreadCount,          Icon: BellRing,      accent: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
            { label: "Alerts",  value: countOf("alert"),     Icon: AlertTriangle, accent: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"         },
            { label: "Today",   value: todayCount,           Icon: Clock,         accent: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
          ].map(function(card) {
            return (
              <div
                key={card.label}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3"
              >
                <div className={"p-2.5 rounded-xl w-fit " + card.accent}>
                  <card.Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={function(e) { setSearchQuery(e.target.value); }}
              placeholder="Search notifications…"
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={function() { setSearchQuery(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter sidebar + list */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Filter sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sticky top-24">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                Filter by type
              </p>
              <div className="space-y-1">
                {FILTER_DEFS.map(function(f) {
                  const active = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={function() { setActiveFilter(f.id); }}
                      className={
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors " +
                        (active
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <f.Icon className="w-4 h-4 flex-shrink-0" />
                        {f.label}
                      </div>
                      <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                        {countOf(f.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notification list */}
          <div className="lg:col-span-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BellOff className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  No notifications found
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  {searchQuery
                    ? "No results for \"" + searchQuery + "\""
                    : activeFilter !== "all"
                    ? "No " + activeFilter + " notifications"
                    : "You're all caught up"}
                </p>
                {(searchQuery || activeFilter !== "all") && (
                  <button
                    onClick={function() { setSearchQuery(""); setActiveFilter("all"); }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map(function(n) {
                const meta = TYPE_META[n.type] ?? TYPE_META.system;
                const unread = !n.read;
                return (
                  <div
                    key={n.id}
                    className={
                      "bg-white dark:bg-gray-900 rounded-2xl border transition-colors group " +
                      (unread
                        ? "border-blue-100 dark:border-blue-900"
                        : "border-gray-100 dark:border-gray-800")
                    }
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-3">

                        <NotifIcon type={n.type} IconOverride={n.icon} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {n.title}
                              </p>
                              {unread && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                                {getTimeAgo(n.timestamp)}
                              </span>
                              <button
                                onClick={function() { deleteNotification(n.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            {n.message}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {unread && (
                              <button
                                onClick={function() { markAsRead(n.id); }}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Mark as read
                              </button>
                            )}

                            {n.action && (
                              <Link
                                to={n.action}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                View
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}

                            <span className={"text-xs px-2.5 py-1 rounded-lg capitalize font-medium " + meta.badge}>
                              {n.type}
                            </span>

                            {n.priority && (
                              <span className={"text-xs px-2.5 py-1 rounded-lg font-medium " + (PRIORITY_BADGE[n.priority] ?? PRIORITY_BADGE.low)}>
                                {n.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · {readRate}% read rate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span>Read status synced to backend</span>
          </div>
        </div>

      </div>
    </div>
  );
}
