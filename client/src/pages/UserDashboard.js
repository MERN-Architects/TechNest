import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's orders
                const ordersResponse = await axios.get('/api/orders/user');
                setOrders(ordersResponse.data);

                // Fetch user's enrolled courses
                const coursesResponse = await axios.get('/api/courses/enrolled');
                setCourses(coursesResponse.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Orders Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
                    {orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="border-b pb-4">
                                    <p className="font-medium">Order #{order._id}</p>
                                    <p className="text-gray-600">Status: {order.status}</p>
                                    <p className="text-gray-600">Total: ${order.total}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No orders found</p>
                    )}
                </div>

                {/* Courses Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
                    {courses.length > 0 ? (
                        <div className="space-y-4">
                            {courses.map((course) => (
                                <div key={course._id} className="border-b pb-4">
                                    <p className="font-medium">{course.title}</p>
                                    <p className="text-gray-600">Progress: {course.progress}%</p>
                                    <button
                                        onClick={() => navigate(`/courses/${course._id}`)}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Continue Learning
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No courses enrolled</p>
                    )}
                </div>
            </div>

            {/* Profile Section */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Member Since</p>
                        <p className="font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/profile/edit')}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
