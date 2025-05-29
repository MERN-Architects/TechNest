const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Service = require('../models/Service');

// Get analytics data
router.get('/analytics', adminAuth, async (req, res) => {
    try {
        const { timeframe } = req.query;
        let startDate;
        const now = new Date();

        // Calculate start date based on timeframe
        switch (timeframe) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        // Get revenue data
        const revenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    'payment.status': 'completed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    amount: { $sum: '$payment.amount' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    amount: 1,
                    _id: 0
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Get total revenue
        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    'payment.status': 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$payment.amount' }
                }
            }
        ]);

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({
            lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const newUsers = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Get service statistics
        const popularServices = await Service.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'service',
                    as: 'orders'
                }
            },
            {
                $project: {
                    title: 1,
                    orderCount: { $size: '$orders' }
                }
            },
            {
                $sort: { orderCount: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'username email');

        res.json({
            revenue: {
                daily: revenue,
                monthly: [], // Implement monthly aggregation if needed
                total: totalRevenue[0]?.total || 0
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                new: newUsers
            },
            services: {
                popular: popularServices
            },
            orders: {
                total: totalOrders,
                recent: recentOrders
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
});

module.exports = router;
