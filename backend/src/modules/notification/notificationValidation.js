// src/modules/notification/notificationValidation.js

const { body, param } = require('express-validator');

/**
 * Validation rules for marking a notification as read
 */
const markAsReadValidation = [
  param('notificationId')
    .trim()
    .notEmpty()
    .withMessage('Notification ID is required')
    .isString()
    .withMessage('Notification ID must be a string'),
  
  body('read')
    .optional()
    .isBoolean()
    .withMessage('Read must be a boolean value')
];

/**
 * Validation rules for marking all notifications as read
 */
const markAllAsReadValidation = [
  body('notificationIds')
    .isArray({ min: 1 })
    .withMessage('notificationIds must be a non-empty array'),
  
  body('notificationIds.*')
    .isString()
    .withMessage('Each notification ID must be a string')
];

/**
 * Validation rules for deleting a notification
 */
const deleteNotificationValidation = [
  param('notificationId')
    .trim()
    .notEmpty()
    .withMessage('Notification ID is required')
    .isString()
    .withMessage('Notification ID must be a string')
];

module.exports = {
  markAsReadValidation,
  markAllAsReadValidation,
  deleteNotificationValidation
};
