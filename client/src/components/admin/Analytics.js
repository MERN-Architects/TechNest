import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        revenue: {
            daily: [],
            monthly: [],
            total: 0
        },
        users: {
            total: 0,
            active: 0,
            new: []
        },
        courses: {
            total: 0,
            popular: [],
            completionRate: []
        },
        enrollments: {
            total: 0,
            recent: []
        }
    });

    const [timeframe, setTimeframe] = useState('week'); // week, month, year

    useEffect(() => {
        fetchAnalytics();
    }, [timeframe]);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`/api/admin/analytics?timeframe=${timeframe}`);
            setAnalytics(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load analytics data');
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center text-gray-300">Loading analytics...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    const revenueData = {
        labels: analytics.revenue.daily.map(d => d.date),
        datasets: [{
            label: 'Daily Revenue',
            data: analytics.revenue.daily.map(d => d.amount),
            borderColor: '#10B981',
            tension: 0.4
        }]
    };

    const userActivityData = {
        labels: analytics.users.new.map(d => d.date),
        datasets: [{
            label: 'New Users',
            data: analytics.users.new.map(d => d.count),
            backgroundColor: '#60A5FA'
        }]
    };

    const courseCompletionData = {
        labels: analytics.courses.popular.map(c => c.title),
        datasets: [{
            data: analytics.courses.popular.map(c => c.enrollments),
            backgroundColor: [
                '#10B981',
                '#60A5FA',
                '#F59E0B',
                '#EC4899',
                '#8B5CF6'
            ]
        }]
    };

    return (
        <div className="p-6">
            {/* Time Frame Selector */}
            <div className="mb-8 flex justify-end">
                <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-white/10 text-white border border-gray-600 rounded-lg px-4 py-2"
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-gray-400 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-white">৳{analytics.revenue.total}</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-gray-400 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-white">{analytics.users.total}</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-gray-400 mb-2">Active Courses</h3>
                    <p className="text-3xl font-bold text-white">{analytics.courses.total}</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-gray-400 mb-2">Total Enrollments</h3>
                    <p className="text-3xl font-bold text-white">{analytics.enrollments.total}</p>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Revenue Trend</h3>
                    <Line
                        data={revenueData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    ticks: { color: '#9CA3AF' },
                                    grid: { color: 'rgba(255,255,255,0.1)' }
                                },
                                x: {
                                    ticks: { color: '#9CA3AF' },
                                    grid: { color: 'rgba(255,255,255,0.1)' }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: { color: '#9CA3AF' }
                                }
                            }
                        }}
                    />
                </motion.div>

                {/* User Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6">New User Registrations</h3>
                    <Bar
                        data={userActivityData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    ticks: { color: '#9CA3AF' },
                                    grid: { color: 'rgba(255,255,255,0.1)' }
                                },
                                x: {
                                    ticks: { color: '#9CA3AF' },
                                    grid: { color: 'rgba(255,255,255,0.1)' }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: { color: '#9CA3AF' }
                                }
                            }
                        }}
                    />
                </motion.div>

                {/* Popular Courses Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Popular Courses</h3>
                    <Doughnut
                        data={courseCompletionData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: { color: '#9CA3AF' }
                                }
                            }
                        }}
                    />
                </motion.div>

                {/* Recent Enrollments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Recent Enrollments</h3>
                    <div className="space-y-4">
                        {analytics.enrollments.recent.map((enrollment, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                            >
                                <div>
                                    <p className="text-white font-medium">{enrollment.courseName}</p>
                                    <p className="text-gray-400">{enrollment.studentName}</p>
                                </div>
                                <p className="text-gray-400">
                                    {new Date(enrollment.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
