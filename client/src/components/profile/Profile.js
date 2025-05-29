import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import TransactionHistory from '../payment/TransactionHistory';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        interests: user?.interests || [],
        notifications: user?.preferences?.notifications || {
            email: true,
            push: true,
            sms: false
        }
    });

    const [profileImage, setProfileImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (type) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'notifications') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (profileImage) {
                formDataToSend.append('profileImage', profileImage);
            }

            const response = await axios.put('/api/users/profile', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            updateUser(response.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {/* Profile Information */}
                <div className="md:col-span-2">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Profile Image */}
                                <div>
                                    <label className="block text-gray-300 mb-2">Profile Image</label>
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={user?.profileImage || '/default-avatar.png'}
                                            alt={user?.name}
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="text-gray-300"
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-gray-300 mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-gray-300 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>

                                {/* Notification Preferences */}
                                <div>
                                    <label className="block text-gray-300 mb-2">Notification Preferences</label>
                                    <div className="space-y-2">
                                        {Object.entries(formData.notifications).map(([type, enabled]) => (
                                            <label key={type} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={enabled}
                                                    onChange={() => handleNotificationChange(type)}
                                                    className="form-checkbox h-5 w-5 text-primary-500 rounded border-gray-600 bg-white/10"
                                                />
                                                <span className="text-gray-300 capitalize">{type} Notifications</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500">{error}</p>
                                )}

                                {success && (
                                    <p className="text-green-500">Profile updated successfully!</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                                        loading
                                            ? 'bg-gray-500 cursor-not-allowed'
                                            : 'bg-primary-500 hover:bg-primary-600'
                                    }`}
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="md:col-span-1">
                    <TransactionHistory />
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
