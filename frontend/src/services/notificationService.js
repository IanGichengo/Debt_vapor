// src/services/notificationService.js - ADD THIS METHOD

import { getDashboardStats } from "./debtService";
import { getDebtors } from "./debtorService";
import { getNotificationStatuses } from "./notificationApi";

/**
 * Generate a stable notification ID based on content
 * This ensures the same notification gets the same ID across page reloads
 */
const generateStableId = (type, key) => {
  return `${type}-${key}`;
};

/**
 * Generate real-time notifications from dashboard data
 */
const generateRealTimeNotifications = async (dashboardData, debtorsData) => {
  const now = new Date();
  const today = now.toLocaleDateString();
  const notifications = [];

  // Fetch notification read statuses from backend
  let notificationStatuses = {};
  try {
    notificationStatuses = await getNotificationStatuses();
  } catch (error) {
    console.error("Failed to fetch notification statuses:", error);
  }

  // Helper function to check if notification should be marked as read
  const isRead = (notificationId) => {
    return notificationStatuses[notificationId]?.read || false;
  };

  // Helper function to check if notification was deleted
  const isDeleted = (notificationId) => {
    return notificationStatuses[notificationId]?.deleted || false;
  };

  // 1. Overdue debts notification
  if (dashboardData.overdueDebts > 0) {
    const notificationId = generateStableId('overdue', 'current');
    if (!isDeleted(notificationId)) {
      const timestamp = new Date(now.getTime() - Math.random() * 3600000);
      const isToday = new Date(timestamp).toLocaleDateString() === today;
      
      notifications.push({
        id: notificationId,
        type: "alert",
        title: `${dashboardData.overdueDebts} Overdue Debt${dashboardData.overdueDebts > 1 ? 's' : ''}`,
        message: `${dashboardData.overdueDebts} debt${dashboardData.overdueDebts > 1 ? 's are' : ' is'} past due date and requires immediate attention.`,
        timestamp: timestamp,
        read: isRead(notificationId) || !isToday,
        priority: "high"
      });
    }
  }

  // 2. Recent payments notification
  if (dashboardData.recentPayments && dashboardData.recentPayments.length > 0) {
    const todayPayments = dashboardData.recentPayments.filter(p => {
      try {
        return new Date(p.date).toLocaleDateString() === today;
      } catch {
        return false;
      }
    });

    if (todayPayments.length > 0) {
      const totalAmount = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const formattedAmount = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
      }).format(totalAmount);

      const notificationId = generateStableId('payment', today);
      if (!isDeleted(notificationId)) {
        const timestamp = new Date(now.getTime() - Math.random() * 7200000);
        const isToday = new Date(timestamp).toLocaleDateString() === today;

        notifications.push({
          id: notificationId,
          type: "payment",
          title: "Payments Received Today",
          message: `${formattedAmount} collected from ${todayPayments.length} payment${todayPayments.length > 1 ? 's' : ''} today.`,
          timestamp: timestamp,
          read: isRead(notificationId) || !isToday,
          priority: "medium"
        });
      }
    }
  }

  // 3. Recovery rate achievement notification
  if (dashboardData.recoveryRate > 75) {
    const notificationId = generateStableId('recovery', 'milestone-75');
    if (!isDeleted(notificationId)) {
      const timestamp = new Date(now.getTime() - Math.random() * 86400000);
      const isToday = new Date(timestamp).toLocaleDateString() === today;

      notifications.push({
        id: notificationId,
        type: "achievement",
        title: "Recovery Rate Milestone",
        message: `Great work! Your recovery rate is at ${dashboardData.recoveryRate}%. Keep it up!`,
        timestamp: timestamp,
        read: isRead(notificationId) || !isToday,
        priority: "low"
      });
    }
  }

  // 4. Upcoming debts notification
  if (dashboardData.upcomingDebts > 0) {
    const notificationId = generateStableId('upcoming', 'current');
    if (!isDeleted(notificationId)) {
      const timestamp = new Date(now.getTime() - Math.random() * 43200000);
      const isToday = new Date(timestamp).toLocaleDateString() === today;

      notifications.push({
        id: notificationId,
        type: "reminder",
        title: `${dashboardData.upcomingDebts} Upcoming Payment${dashboardData.upcomingDebts > 1 ? 's' : ''}`,
        message: `${dashboardData.upcomingDebts} payment${dashboardData.upcomingDebts > 1 ? 's are' : ' is'} due in the next 7 days.`,
        timestamp: timestamp,
        read: isRead(notificationId) || !isToday,
        priority: "medium"
      });
    }
  }

  // 5. High outstanding balance alert
  if (dashboardData.totalOutstanding > 1000000) {
    const notificationId = generateStableId('high-balance', 'current');
    if (!isDeleted(notificationId)) {
      const timestamp = new Date(now.getTime() - Math.random() * 7200000);
      const isToday = new Date(timestamp).toLocaleDateString() === today;

      notifications.push({
        id: notificationId,
        type: "alert",
        title: "High Outstanding Balance",
        message: `Total outstanding balance is ${new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0
        }).format(dashboardData.totalOutstanding)}. Consider following up on overdue debts.`,
        timestamp: timestamp,
        read: isRead(notificationId) || !isToday,
        priority: "high"
      });
    }
  }

  // 6. System status notification
  const notificationId = generateStableId('system', today);
  if (!isDeleted(notificationId)) {
    const timestamp = new Date(now.getTime() - Math.random() * 1800000);
    const isToday = new Date(timestamp).toLocaleDateString() === today;

    notifications.push({
      id: notificationId,
      type: "system",
      title: "System Status",
      message: "All systems are running optimally. Data sync completed successfully.",
      timestamp: timestamp,
      read: isRead(notificationId) || !isToday,
      priority: "low"
    });
  }

  // 7. Daily summary notification
  const summaryId = generateStableId('summary', today);
  if (!isDeleted(summaryId)) {
    const summaryTimestamp = new Date(now.getTime() - Math.random() * 14400000);
    const summaryIsToday = new Date(summaryTimestamp).toLocaleDateString() === today;

    notifications.push({
      id: summaryId,
      type: "summary",
      title: "Daily Collection Summary",
      message: `Today's collection target: ${dashboardData.recoveryRate > 50 ? 'On track' : 'Needs attention'}. ${dashboardData.activeDebts} active debts being managed.`,
      timestamp: summaryTimestamp,
      read: isRead(summaryId) || !summaryIsToday,
      priority: "medium"
    });
  }

  return notifications;
};

/**
 * Get all notifications with read status from backend
 */
export const getNotifications = async () => {
  try {
    const dashboardData = await getDashboardStats();
    const debtorsData = await getDebtors();

    const notifications = await generateRealTimeNotifications(dashboardData, debtorsData);

    // Sort notifications by time (newest first)
    return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
};

/**
 * Get unread notification count
 * ⭐ NEW: This is the function to use for badge counts
 */
export const getUnreadNotificationCount = async () => {
  try {
    const notifications = await getNotifications();
    const unread = notifications.filter(notification => !notification.read).length;
    return unread;
  } catch (error) {
    console.error("Failed to fetch unread notification count:", error);
    return 0;
  }
};
