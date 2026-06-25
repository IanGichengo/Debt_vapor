// src/modules/notification/notificationService.js

const prisma = require('../../config/database');

class NotificationService {
  /**
   * Get all notification statuses for a user
   */
  async getNotificationStatuses(userId) {
    try {
      const statuses = await prisma.notificationStatus.findMany({
        where: { userId },
        select: {
          notificationId: true,
          read: true,
          deleted: true,
          updatedAt: true
        }
      });

      // Convert to object format { notificationId: { read, deleted, updatedAt } }
      const statusesMap = {};
      statuses.forEach(status => {
        statusesMap[status.notificationId] = {
          read: status.read,
          deleted: status.deleted,
          updatedAt: status.updatedAt
        };
      });

      return statusesMap;
    } catch (error) {
      console.error('Error fetching notification statuses:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read or unread
   */
  async markAsRead(userId, notificationId, read = true) {
    try {
      const notificationStatus = await prisma.notificationStatus.upsert({
        where: {
          userId_notificationId: {
            userId,
            notificationId
          }
        },
        update: {
          read,
          updatedAt: new Date()
        },
        create: {
          userId,
          notificationId,
          read,
          deleted: false
        }
      });

      return notificationStatus;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markAllAsRead(userId, notificationIds) {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error('notificationIds must be a non-empty array');
      }

      // Use transaction for atomic operations
      const results = await prisma.$transaction(
        notificationIds.map(notificationId =>
          prisma.notificationStatus.upsert({
            where: {
              userId_notificationId: {
                userId,
                notificationId
              }
            },
            update: {
              read: true,
              updatedAt: new Date()
            },
            create: {
              userId,
              notificationId,
              read: true,
              deleted: false
            }
          })
        )
      );

      return results;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification (soft delete)
   */
  async deleteNotification(userId, notificationId) {
    try {
      const notificationStatus = await prisma.notificationStatus.upsert({
        where: {
          userId_notificationId: {
            userId,
            notificationId
          }
        },
        update: {
          deleted: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          notificationId,
          read: true,
          deleted: true
        }
      });

      return notificationStatus;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications for a user (soft delete)
   */
  async clearAll(userId) {
    try {
      const result = await prisma.notificationStatus.updateMany({
        where: { userId },
        data: {
          deleted: true,
          updatedAt: new Date()
        }
      });

      return result;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Cleanup old deleted notifications (30+ days)
   * This should be run periodically via cron job
   */
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notificationStatus.deleteMany({
        where: {
          deleted: true,
          updatedAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
