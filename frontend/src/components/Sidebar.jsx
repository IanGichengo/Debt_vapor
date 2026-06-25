import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNotificationCount } from "../hooks/useNotificationCount";

import {
  Home,
  Users,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Pin,
  ChevronLeft,
  UserCircle,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(false);

  const hoverTimeout = useRef(null);
  const { notificationCount, loading } = useNotificationCount();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const handleMouseEnter = () => {
    if (!pinned) {
      clearTimeout(hoverTimeout.current);
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!pinned) {
      hoverTimeout.current = setTimeout(() => setCollapsed(true), 150);
    }
  };

  const togglePin = () => {
    setPinned((prev) => {
      const next = !prev;
      setCollapsed(!next);
      return next;
    });
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      to: "/dashboard/debtors",
      label: "Debtors",
      icon: <Users className="w-5 h-5" />,
    },
    {
      to: "/dashboard/reports",
      label: "Reports",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      to: "/dashboard/notifications",
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      badge: notificationCount,
      showBadge: notificationCount > 0,
      loading: loading,
    },
    {
      to: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      to: "/dashboard/help",
      label: "Help Center",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-screen bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200 dark:border-gray-700 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header — logo always visible, pin only when expanded */}
      <div className="px-4 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/favicon.svg"
            alt="logo"
            className="h-10 w-10 flex-shrink-0"
          />
          {!collapsed && (
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Creditor Dashboard
            </p>
          )}
        </div>

        {/* Pin button — only rendered when sidebar is expanded */}
        {!collapsed && (
          <button
            onClick={togglePin}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
            title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          >
            {pinned ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <SidebarLink
            key={item.to}
            {...item}
            collapsed={collapsed}
            index={index}
          />
        ))}
      </nav>

      {/* Footer — My Account + user info + logout */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-1">
        {/* My Account link */}
        <SidebarLink
          to="/dashboard/account"
          label="My Account"
          icon={<UserCircle className="w-5 h-5" />}
          collapsed={collapsed}
          index={navItems.length}
        />

        {/* User info row */}
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="h-9 w-9 rounded-full bg-blue-700 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">
                {getInitials(user?.name || user?.firstName)}
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || user?.email || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "Admin"}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ============================================
// SIDEBAR LINK
// ============================================

function SidebarLink({
  to,
  icon,
  label,
  collapsed,
  badge,
  showBadge,
  loading,
  index,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <NavLink
        to={to}
        end={to === "/dashboard"}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          } ${collapsed ? "justify-center" : ""}`
        }
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          animationDelay: `${index * 40}ms`,
          animation: "slideInLeft 0.25s ease-out both",
        }}
      >
        <span className="flex-shrink-0">{icon}</span>

        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        )}

        {/* Badge — text when expanded */}
        {showBadge && badge > 0 && !collapsed && (
          <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
            {badge > 99 ? "99+" : badge}
          </span>
        )}

        {/* Badge — dot when collapsed */}
        {showBadge && badge > 0 && collapsed && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        )}

        {loading && (
          <div className="ml-auto h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </NavLink>

      {/* Tooltip — only when collapsed */}
      {collapsed && showTooltip && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
          {label}
          {showBadge && badge > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
        </div>
      )}
    </div>
  );
}
