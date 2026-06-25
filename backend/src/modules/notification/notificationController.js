// src/modules/notification/notificationController.js

const notificationService = require('./notificationService');

class NotificationController {
  /**
   * @route   GET /api/notifications/statuses
   * @desc    Get all notification statuses for the authenticated user
   * @access  Private
   */
  async getNotificationStatuses(req, res, next) {
    try {
      const userId = req.user.id;

      const statuses = await notificationService.getNotificationStatuses(userId);

      res.status(200).json({
        success: true,
        statuses
      });
    } catch (error) {
      console.error('Error in getNotificationStatuses:', error);
      next(error);
    }
  }

  /**
   * @route   PUT /api/notifications/:notificationId/read
   * @desc    Mark a notification as read or unread
   * @access  Private
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;
      const { read = true } = req.body;

      const notification = await notificationService.markAsRead(
        userId,
        notificationId,
        read
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        notification
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      next(error);
    }
  }

  /**
   * @route   PUT /api/notifications/mark-all-read
   * @desc    Mark all notifications as read
   * @access  Private
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          success: false,
          message: 'notificationIds must be an array'
        });
      }

      const results = await notificationService.markAllAsRead(userId, notificationIds);

      res.status(200).json({
        success: true,
        message: `${results.length} notifications marked as read`,
        count: results.length
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      next(error);
    }
  }

  /**
   * @route   DELETE /api/notifications/:notificationId
   * @desc    Delete a notification (soft delete)
   * @access  Private
   */
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationService.deleteNotification(
        userId,
        notificationId
      );

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
        notification
      });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      next(error);
    }
  }

  /**
   * @route   DELETE /api/notifications/clear-all
   * @desc    Clear all notifications for the user
   * @access  Private
   */
  async clearAll(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await notificationService.clearAll(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications cleared',
        count: result.count
      });
    } catch (error) {
      console.error('Error in clearAll:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/notifications/cleanup
   * @desc    Cleanup old deleted notifications (Admin only)
   * @access  Private/Admin
   */
  async cleanupOldNotifications(req, res, next) {
    try {
      // Optional: Add admin check here
      // if (req.user.role !== 'ADMIN') {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Admin access required'
      //   });
      // }

      const result = await notificationService.cleanupOldNotifications();

      res.status(200).json({
        success: true,
        message: `Cleaned up ${result.count} old notifications`,
        count: result.count
      });
    } catch (error) {
      console.error('Error in cleanupOldNotifications:', error);
      next(error);
    }
  }
}

module.exports = new NotificationController();
