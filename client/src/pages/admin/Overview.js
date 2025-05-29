import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';

const Overview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalPosts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/admin/stats');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <div className="text-sm text-gray-400 mt-2">Active users in the system</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                    <div className="text-sm text-gray-400 mt-2">Orders processed</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-bold">${stats.totalRevenue}</p>
                    <div className="text-sm text-gray-400 mt-2">Revenue generated</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Blog Posts</h3>
                    <p className="text-3xl font-bold">{stats.totalPosts}</p>
                    <div className="text-sm text-gray-400 mt-2">Published posts</div>
                </div>
            </div>

            {/* Add more dashboard widgets as needed */}
        </div>
    );
};

export default Overview;
