// src/services/reminderService.js

// Use import.meta.env for Vite instead of process.env
import { API_URL } from "../config/api";

const REMINDER_API = `${API_URL}/api`;

/**
 * Get reminder settings for a specific debtor
 * @param {string} debtorId - The debtor's ID
 * @returns {Promise<Object>} - The reminder settings
 */
export const getReminderSettings = async (debtorId) => {
  try {
    const token = localStorage.getItem('accessToken'); // FIXED: Changed from 'token' to 'accessToken'
    
    const response = await fetch(`${API_BASE_URL}/debtors/${debtorId}/reminder-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      // If no settings found (404), return null
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch reminder settings');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    throw error;
  }
};

/**
 * Save reminder settings for a specific debtor
 * @param {string} debtorId - The debtor's ID
 * @param {Object} settings - The reminder settings to save
 * @returns {Promise<Object>} - The saved settings
 */
export const saveReminderSettings = async (debtorId, settings) => {
  try {
    const token = localStorage.getItem('accessToken'); // FIXED: Changed from 'token' to 'accessToken'
    
    const response = await fetch(`${API_BASE_URL}/debtors/${debtorId}/reminder-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save reminder settings');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    throw error;
  }
};

/**
 * Get user's default reminder settings
 * @returns {Promise<Object>} - The default reminder settings
 */
export const getDefaultReminderSettings = async () => {
  try {
    const token = localStorage.getItem('accessToken'); // FIXED: Changed from 'token' to 'accessToken'
    
    const response = await fetch(`${API_BASE_URL}/reminder-settings/defaults`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch default reminder settings');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching default reminder settings:', error);
    throw error;
  }
};

/**
 * Save user's default reminder settings
 * @param {Object} settings - The default reminder settings to save
 * @returns {Promise<Object>} - The saved settings
 */
export const saveDefaultReminderSettings = async (settings) => {
  try {
    const token = localStorage.getItem('accessToken'); // FIXED: Changed from 'token' to 'accessToken'
    
    const response = await fetch(`${API_BASE_URL}/reminder-settings/defaults`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save default reminder settings');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error saving default reminder settings:', error);
    throw error;
  }
};

export default {
  getReminderSettings,
  saveReminderSettings,
  getDefaultReminderSettings,
  saveDefaultReminderSettings,
};
