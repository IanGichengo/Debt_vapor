// src/hooks/useNotificationCount.js
// Custom hook to fetch real unread notification count from backend

import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getUnreadNotificationCount } from "../services/notificationService";

export const useNotificationCount = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  const fetchNotificationCount = async () => {
    if (!user) {
      setNotificationCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch real unread count from backend
      const count = await getUnreadNotificationCount();
      
      // Cap the count at 99 for display
      setNotificationCount(Math.min(count, 99));

    } catch (error) {
      console.error("Failed to fetch notification count:", error);
      // On error, set to 0 instead of showing incorrect data
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationCount();

    // Refresh notification count every 2 minutes
    const interval = setInterval(fetchNotificationCount, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return { 
    notificationCount, 
    loading, 
    refreshCount: fetchNotificationCount 
  };
};
