import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const PaymentProcessor = ({ amount, orderId, onSuccess, onError }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const [phone, setPhone] = useState('');

    const paymentMethods = [
        {
            id: 'bkash',
            name: 'bKash',
            icon: '/payment-icons/bkash.png',
            description: 'Pay with bKash mobile banking'
        },
        {
            id: 'nagad',
            name: 'Nagad',
            icon: '/payment-icons/nagad.png',
            description: 'Pay with Nagad mobile banking'
        },
        {
            id: 'payoneer',
            name: 'Payoneer',
            icon: '/payment-icons/payoneer.png',
            description: 'Pay with Payoneer (International)'
        }
    ];

    const handlePayment = async () => {
        if (!selectedMethod || !phone) return;
        
        setProcessing(true);
        try {
            const response = await axios.post('/api/payment/process', {
                method: selectedMethod,
                amount,
                orderId,
                phone
            });

            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                onSuccess(response.data);
            }
        } catch (error) {
            onError(error.response?.data?.message || 'Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Select Payment Method</h2>
            
            <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                    <motion.div
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedMethod === method.id 
                                ? 'bg-primary-500/20 border-2 border-primary-500' 
                                : 'bg-white/5 border-2 border-transparent'
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            <img 
                                src={method.icon} 
                                alt={method.name} 
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <h3 className="text-lg font-medium text-white">{method.name}</h3>
                                <p className="text-gray-400 text-sm">{method.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {selectedMethod && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <label className="block text-gray-300 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    />
                </motion.div>
            )}

            <div className="text-lg font-medium text-white mb-6">
                Amount to Pay: ৳{amount}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!selectedMethod || !phone || processing}
                onClick={handlePayment}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                    processing || !selectedMethod || !phone
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-primary-500 hover:bg-primary-600'
                }`}
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </motion.button>
        </div>
    );
};

export default PaymentProcessor;
