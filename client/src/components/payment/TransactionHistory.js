import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`/api/payment/transactions?filter=${filter}`);
            setTransactions(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load transactions');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-500';
            case 'pending':
                return 'text-yellow-500';
            case 'failed':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    if (loading) return <div className="text-center text-gray-300">Loading transactions...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/10 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500"
                >
                    <option value="all">All Transactions</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <div className="space-y-4">
                {transactions.map((transaction) => (
                    <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 rounded-lg p-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    {transaction.orderId}
                                </h3>
                                <p className="text-gray-400">
                                    {new Date(transaction.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-medium text-white">
                                    ৳{transaction.amount}
                                </p>
                                <p className={`${getStatusColor(transaction.status)}`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <p className="text-gray-400">
                                Payment Method: {transaction.paymentMethod}
                            </p>
                            {transaction.status === 'failed' && (
                                <button
                                    onClick={() => window.location.href = `/checkout?retry=${transaction.orderId}`}
                                    className="text-primary-400 hover:text-primary-300"
                                >
                                    Retry Payment
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {transactions.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        No transactions found
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
