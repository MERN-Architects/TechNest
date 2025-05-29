const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'course_update',
            'new_enrollment',
            'certificate_ready',
            'payment_success',
            'course_reminder',
            'system_announcement'
        ],
        required: true
    },
    data: {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        courseName: String,
        updateDetails: String,
        amount: Number,
        progress: Number,
        certificateUrl: String,
        message: String
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for quick lookups
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
