// ========================================
// FRONTEND: Settings API Service
// src/services/settingsApi.js
// ========================================

import api from './api'; // Your existing axios instance

/**
 * Get user settings from backend
 * @returns {Promise<Object>} User settings object
 */
export const getUserSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data.settings;
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    
    // Return default settings on error
    return {
      notifications: {
        newDebtor: true,
        overdueAlert: true,
        paymentReceived: true,
        weeklyReport: true,
        marketingEmails: false,
        soundEnabled: true,
        desktopNotifications: true
      },
      notificationChannels: {
        email: true,
        sms: false,
        push: true
      },
      profile: {
        language: 'en',
        currency: 'KES',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'Africa/Nairobi',
        autoRefresh: true,
        refreshInterval: '5'
      }
    };
  }
};

/**
 * Save user settings to backend
 * @param {Object} settings - Settings object to save
 * @returns {Promise<Object>} Response from server
 */
export const saveUserSettings = async (settings) => {
  try {
    const response = await api.put('/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to save user settings:', error);
    throw error;
  }
};

/**
 * Check if a specific notification type is enabled
 * @param {string} notificationType - Type of notification to check
 * @returns {Promise<boolean>} Whether the notification type is enabled
 */
export const isNotificationEnabled = async (notificationType) => {
  try {
    const settings = await getUserSettings();
    return settings.notifications[notificationType] ?? true;
  } catch (error) {
    console.error('Failed to check notification setting:', error);
    return true; // Default to enabled on error
  }
};

/**
 * Get enabled notification channels
 * @returns {Promise<Object>} Enabled channels { email, sms, push }
 */
export const getEnabledChannels = async () => {
  try {
    const settings = await getUserSettings();
    return settings.notificationChannels;
  } catch (error) {
    console.error('Failed to fetch enabled channels:', error);
    return {
      email: true,
      sms: false,
      push: true
    };
  }
};
