const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');

class NotificationService {
    static async createNotification(userId, type, data) {
        try {
            const notification = new Notification({
                user: userId,
                type,
                data,
                read: false
            });

            await notification.save();

            // Get user's notification preferences
            const user = await User.findById(userId);
            
            if (user.preferences?.notifications?.email) {
                await this.sendEmailNotification(user.email, type, data);
            }

            return notification;
        } catch (error) {
            console.error('Notification creation error:', error);
            throw error;
        }
    }

    static async sendEmailNotification(email, type, data) {
        let subject = '';
        let message = '';

        switch (type) {
            case 'course_update':
                subject = `Course Update: ${data.courseName}`;
                message = `The course "${data.courseName}" has been updated with new content: ${data.updateDetails}`;
                break;
            
            case 'new_enrollment':
                subject = `Welcome to ${data.courseName}`;
                message = `You have successfully enrolled in "${data.courseName}". Start learning now!`;
                break;
            
            case 'certificate_ready':
                subject = `Your Certificate is Ready!`;
                message = `Congratulations! Your certificate for completing "${data.courseName}" is now available.`;
                break;
            
            case 'payment_success':
                subject = 'Payment Successful';
                message = `Your payment of ৳${data.amount} for "${data.courseName}" has been processed successfully.`;
                break;
            
            case 'course_reminder':
                subject = 'Continue Learning';
                message = `Don't forget to continue your progress in "${data.courseName}". You're ${data.progress}% through the course!`;
                break;

            default:
                subject = 'TechNest Notification';
                message = 'You have a new notification from TechNest.';
        }

        await emailService.sendEmail(email, subject, message);
    }

    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, user: userId },
                { read: true },
                { new: true }
            );

            return notification;
        } catch (error) {
            console.error('Mark notification as read error:', error);
            throw error;
        }
    }

    static async getUnreadCount(userId) {
        try {
            return await Notification.countDocuments({
                user: userId,
                read: false
            });
        } catch (error) {
            console.error('Get unread count error:', error);
            throw error;
        }
    }

    static async getUserNotifications(userId, page = 1, limit = 10) {
        try {
            const notifications = await Notification.find({ user: userId })
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('data.course', 'title');

            const total = await Notification.countDocuments({ user: userId });

            return {
                notifications,
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Get user notifications error:', error);
            throw error;
        }
    }

    static async createCourseUpdateNotification(courseId, updateDetails) {
        try {
            const course = await Course.findById(courseId)
                .populate('enrolledStudents', '_id');

            const notifications = [];
            for (const student of course.enrolledStudents) {
                const notification = await this.createNotification(student._id, 'course_update', {
                    course: courseId,
                    courseName: course.title,
                    updateDetails
                });
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            console.error('Course update notification error:', error);
            throw error;
        }
    }

    static async createCourseReminderNotifications() {
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const inactiveEnrollments = await Enrollment.find({
                lastAccessedAt: { $lt: twoDaysAgo },
                status: 'active',
                progress: { $lt: 100 }
            }).populate('user course');

            const notifications = [];
            for (const enrollment of inactiveEnrollments) {
                const notification = await this.createNotification(
                    enrollment.user._id,
                    'course_reminder',
                    {
                        course: enrollment.course._id,
                        courseName: enrollment.course.title,
                        progress: enrollment.progress
                    }
                );
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            console.error('Course reminder notification error:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
