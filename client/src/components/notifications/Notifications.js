import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../utils/axios';
import { format } from 'date-fns';
import {
    BellIcon,
    BookOpenIcon,
    AcademicCapIcon,
    CreditCardIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchUnreadCount, 30000); // Check for new notifications every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/notifications?page=${pageNum}`);
            
            if (pageNum === 1) {
                setNotifications(response.data.notifications);
            } else {
                setNotifications(prev => [...prev, ...response.data.notifications]);
            }
            
            setHasMore(response.data.notifications.length === 10);
            setUnreadCount(response.data.unreadCount);
            setLoading(false);
        } catch (err) {
            setError('Failed to load notifications');
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/api/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'course_update':
                return <BookOpenIcon className="h-6 w-6 text-blue-500" />;
            case 'certificate_ready':
                return <AcademicCapIcon className="h-6 w-6 text-green-500" />;
            case 'payment_success':
                return <CreditCardIcon className="h-6 w-6 text-purple-500" />;
            case 'course_reminder':
                return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
            default:
                return <BellIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
            >
                <BellIcon className="h-6 w-6 text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 rounded-xl shadow-lg z-50"
                    >
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Notifications</h3>
                        </div>

                        {loading && notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                Loading notifications...
                            </div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">
                                {error}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                No notifications yet
                            </div>
                        ) : (
                            <>
                                {notifications.map((notification) => (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`p-4 border-b border-gray-700 hover:bg-white/5 transition-colors ${
                                            !notification.read ? 'bg-white/5' : ''
                                        }`}
                                        onClick={() => markAsRead(notification._id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1">
                                                <p className="text-white">
                                                    {notification.data.message || 
                                                    (notification.type === 'course_update' && 
                                                        `${notification.data.courseName} has been updated with new content`)}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {hasMore && (
                                    <button
                                        onClick={() => {
                                            setPage(prev => prev + 1);
                                            fetchNotifications(page + 1);
                                        }}
                                        className="w-full p-4 text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        Load More
                                    </button>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;
