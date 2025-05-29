import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const TwoFactorVerify = ({ email, onVerified, onCancel }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [remainingAttempts, setRemainingAttempts] = useState(3);

    const verifyCode = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/api/auth/2fa/login', {
                email,
                token: code
            });

            onVerified(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid verification code');
            setRemainingAttempts(prev => prev - 1);
            
            if (remainingAttempts <= 1) {
                onCancel();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-xl"
        >
            <h2 className="text-2xl font-bold text-white mb-6">
                Two-Factor Verification
            </h2>

            <p className="text-gray-300 mb-6">
                Enter the verification code from your authenticator app to continue.
            </p>

            <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                    Verification Code
                </label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
            </div>

            {error && (
                <div className="mb-4">
                    <p className="text-red-500">{error}</p>
                    <p className="text-gray-400 text-sm">
                        Remaining attempts: {remainingAttempts}
                    </p>
                </div>
            )}

            <div className="flex space-x-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={verifyCode}
                    disabled={loading || code.length !== 6}
                    className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
                        loading || code.length !== 6
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                >
                    {loading ? 'Verifying...' : 'Verify'}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    disabled={loading}
                    className="py-3 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-white/5"
                >
                    Cancel
                </motion.button>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={() => window.location.href = '/contact'}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                >
                    Having trouble? Contact support
                </button>
            </div>
        </motion.div>
    );
};

export default TwoFactorVerify;
