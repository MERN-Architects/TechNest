import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from '../utils/axios';

const TestConnection = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('Testing connection to server...');
                const response = await axios.get('/test');
                console.log('Server response:', response.data);
                setMessage(response.data.message);
            } catch (err) {
                console.error('Connection error:', err);
                setError('Failed to connect to server: ' + (err.response?.data?.message || err.message));
            }
        };

        testConnection();
    }, []);

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`max-w-md w-full space-y-4 p-8 rounded-lg shadow ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
                <h2 className="text-2xl font-bold text-center">Connection Test</h2>
                {message && (
                    <div className={`p-4 rounded ${
                        isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    }`}>
                        {message}
                    </div>
                )}
                {error && (
                    <div className={`p-4 rounded ${
                        isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                    }`}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestConnection;