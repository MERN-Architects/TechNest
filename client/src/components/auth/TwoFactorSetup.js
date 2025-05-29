import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import axios from '../../utils/axios';

const TwoFactorSetup = ({ onComplete }) => {
    const [step, setStep] = useState('generate');
    const [secret, setSecret] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateSecret = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/auth/2fa/generate');
            setSecret(response.data.secret);
            setQrCode(response.data.qrCode);
            setStep('verify');
        } catch (err) {
            setError('Failed to generate 2FA secret');
        } finally {
            setLoading(false);
        }
    };

    const verifySetup = async () => {
        try {
            setLoading(true);
            setError(null);
            
            await axios.post('/api/auth/2fa/verify', {
                token: verificationCode,
                secret
            });
            
            onComplete();
        } catch (err) {
            setError('Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
                Two-Factor Authentication Setup
            </h2>

            {step === 'generate' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-gray-300 mb-6">
                        Enable two-factor authentication to add an extra layer of security to your account.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateSecret}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                            loading
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                    >
                        {loading ? 'Generating...' : 'Start Setup'}
                    </motion.button>
                </motion.div>
            )}

            {step === 'verify' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center mb-6">
                        <QRCode
                            value={qrCode}
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="mx-auto bg-white p-2 rounded-lg"
                        />
                    </div>

                    <p className="text-gray-300 mb-6">
                        Scan this QR code with your authenticator app, then enter the verification code below.
                    </p>

                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 mb-4">{error}</p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={verifySetup}
                        disabled={loading || !verificationCode}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                            loading || !verificationCode
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                    >
                        {loading ? 'Verifying...' : 'Verify and Enable'}
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
