const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auditLog, sanitizeUserData, securityHeaders } = require('../utils/security');
const rateLimit = require('express-rate-limit');

// Create rate limiter
const authRateLimiter = rateLimit({
    max: 5, // More strict limit for auth endpoints
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts, please try again later.'
});

const auth = async (req, res, next) => {
    try {
        // Apply security headers
        Object.entries(securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        // Get token from cookie or Authorization header
        let token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                code: 'TOKEN_MISSING',
                message: 'Authentication required'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {
                audience: process.env.JWT_AUDIENCE || 'technest-api',
                issuer: process.env.JWT_ISSUER || 'technest'
            });
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    code: 'TOKEN_EXPIRED',
                    message: 'Token has expired'
                });
            }
            throw err;
        }

        const user = await User.findOne({ _id: decoded.uid }).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user's password hasn't changed since token was issued
        if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
            throw new Error('User recently changed password. Please login again');
        }

        // Audit successful authentication
        await auditLog(user._id, 'authentication', 'success', {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            resourceType: 'auth',
            details: {
                method: 'token',
                path: req.path
            }
        });

        // Apply data minimization
        req.token = token;
        req.user = sanitizeUserData(user.toObject());
        next();
    } catch (error) {
        // Audit failed authentication
        await auditLog(
            null,
            'authentication',
            'failure',
            {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                resourceType: 'auth',
                details: {
                    method: 'token',
                    path: req.path,
                    error: error.message
                }
            }
        );

        res.status(401).json({ message: 'Please authenticate.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                // Audit unauthorized admin access attempt
                auditLog(
                    req.user._id,
                    'admin_access',
                    'failure',
                    {
                        ip: req.ip,
                        userAgent: req.headers['user-agent'],
                        resourceType: 'admin',
                        details: {
                            path: req.path,
                            userRole: req.user.role
                        }
                    }
                );

                return res.status(403).json({ message: 'Access denied. Admin only.' });
            }

            // Audit successful admin access
            auditLog(
                req.user._id,
                'admin_access',
                'success',
                {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    resourceType: 'admin',
                    details: {
                        path: req.path
                    }
                }
            );

            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate.' });
    }
};

module.exports = { auth, adminAuth, authRateLimiter };