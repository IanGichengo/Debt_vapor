// src/services/notificationApi.js - Using your existing axios setup

import api from './api';

/**
 * Get all notification read statuses for the current user
 */
export const getNotificationStatuses = async () => {
  try {
    const response = await api.get('/notifications/statuses');
    return response.data.statuses || {};
  } catch (error) {
    console.error('Error fetching notification statuses:', error);
    // Return empty object if backend is not available
    return {};
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`, {
      read: true
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (notificationIds) => {
  try {
    const response = await api.put('/notifications/mark-all-read', {
      notificationIds
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification status (soft delete)
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Clear all notifications for the user
 */
export const clearAllNotifications = async () => {
  try {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
};
