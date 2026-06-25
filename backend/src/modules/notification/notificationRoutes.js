// src/modules/notification/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');
const authenticate = require('../../middleware/authenticate');

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications/statuses
 * @desc    Get all notification read/deleted statuses for the current user
 * @access  Private
 */
router.get('/statuses', notificationController.getNotificationStatuses);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark a notification as read/unread
 * @access  Private
 */
router.put('/:notificationId/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a notification (soft delete)
 * @access  Private
 */
router.delete('/:notificationId', notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications/clear-all
 * @desc    Clear all notifications for the user
 * @access  Private
 */
router.delete('/clear-all', notificationController.clearAll);

/**
 * @route   POST /api/notifications/cleanup
 * @desc    Clean up old deleted notifications (admin only - optional)
 * @access  Private/Admin
 */
router.post('/cleanup', notificationController.cleanupOldNotifications);

module.exports = router;
