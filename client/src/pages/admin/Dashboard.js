import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    ChartBarIcon,
    UserGroupIcon,
    EnvelopeIcon,
    CogIcon,
    BellIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    QueueListIcon,
    UserIcon,
    ArrowTrendingUpIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import Analytics from '../../components/admin/Analytics';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const { isDarkMode } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Dashboard Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalServices: 0,
        recentActivity: [],
        orderStats: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [0, 0, 0, 0, 0, 0]
        },
        revenueStats: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [0, 0, 0, 0, 0, 0]
        }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/dashboard', {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        logout();
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setStats(data);
                setNotifications(data.notifications || []);
            } catch (error) {
                console.error('Dashboard data fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        
        // Set up real-time updates with WebSocket
        const ws = new WebSocket('ws://localhost:5000');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
                setNotifications(prev => [data.notification, ...prev]);
            }
            if (data.type === 'stats_update') {
                setStats(prev => ({ ...prev, ...data.stats }));
            }
        };

        return () => {
            ws.close();
        };
    }, [logout, navigate]);

    const menuItems = [
        { id: 'overview', icon: ChartBarIcon, label: 'Overview' },
        { id: 'orders', icon: ShoppingBagIcon, label: 'Orders' },
        { id: 'services', icon: QueueListIcon, label: 'Services' },
        { id: 'users', icon: UserGroupIcon, label: 'Users' },
        { id: 'messages', icon: EnvelopeIcon, label: 'Messages' },
        { id: 'settings', icon: CogIcon, label: 'Settings' }
    ];

    // Enhanced stats cards component
    const StatsCard = ({ title, value, icon: Icon, trend, color }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                        {typeof value === 'number' && title.includes('Revenue') ? 
                            `$${value.toLocaleString()}` : value.toLocaleString()}
                    </h3>
                    {trend && (
                        <p className={`text-sm mt-2 flex items-center ${
                            trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${
                                trend > 0 ? '' : 'transform rotate-180'
                            }`} />
                            {Math.abs(trend)}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </motion.div>
    );

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: isDarkMode ? '#374151' : 'white',
                titleColor: isDarkMode ? 'white' : '#111827',
                bodyColor: isDarkMode ? 'white' : '#111827',
                borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDarkMode ? '#374151' : '#F3F4F6'
                },
                ticks: {
                    color: isDarkMode ? '#9CA3AF' : '#4B5563'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: isDarkMode ? '#9CA3AF' : '#4B5563'
                }
            }
        }
    };

    // Revenue chart data
    const revenueChartData = {
        labels: stats.revenueStats.labels,
        datasets: [
            {
                label: 'Revenue',
                data: stats.revenueStats.data,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderColor: '#6366F1',
                tension: 0.4
            }
        ]
    };

    // Orders chart data
    const ordersChartData = {
        labels: stats.orderStats.labels,
        datasets: [
            {
                label: 'Orders',
                data: stats.orderStats.data,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10B981',
                tension: 0.4
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-10">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {menuItems.map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === id
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                {label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Welcome back, {user?.username}! Here's what's happening today.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                        >
                            <BellIcon className="h-6 w-6" />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                            )}
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                        >
                            <ArrowPathIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Revenue"
                        value={stats.totalRevenue}
                        icon={CurrencyDollarIcon}
                        trend={12}
                        color="bg-indigo-600"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon={ShoppingBagIcon}
                        trend={8}
                        color="bg-green-600"
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={UserGroupIcon}
                        trend={5}
                        color="bg-blue-600"
                    />
                    <StatsCard
                        title="Total Services"
                        value={stats.totalServices}
                        icon={QueueListIcon}
                        trend={-2}
                        color="bg-purple-600"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                        <div className="h-80">
                            <Line data={revenueChartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Orders Overview</h3>
                        <div className="h-80">
                            <Line data={ordersChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-4">
                            {stats.recentActivity?.map((activity, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-4"
                                >
                                    <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                        activity.type === 'order' ? 'bg-green-100' : 'bg-blue-100'
                                    }`}>
                                        {activity.type === 'order' ? (
                                            <ShoppingBagIcon className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                                        )}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {activity.message}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(activity.time).toLocaleString()}
                                        </p>
                                    </div>
                                    {activity.amount && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ${activity.amount}
                                        </span>
                                    )}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Notifications Panel */}
                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50 p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <ul className="space-y-4">
                                {notifications.map((notification, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(notification.time).toLocaleString()}
                                        </p>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Analytics Component */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <Analytics />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
