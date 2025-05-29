const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateTOTP, verifyTOTP } = require('../utils/twoFactorAuth');

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        res.status(201).json({ 
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, totpCode } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +twoFactorSecret');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked && user.isLocked()) {
            return res.status(423).json({ 
                message: 'Account is locked. Please try again later.',
                lockUntil: user.lockUntil
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            await user.incrementLoginAttempts();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Reset login attempts on successful password verification
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // Verify 2FA if enabled
        if (user.isTwoFactorEnabled) {
            if (!totpCode) {
                return res.status(403).json({ 
                    message: 'Two-factor authentication required',
                    requiresTwoFactor: true 
                });
            }

            const isValidTOTP = verifyTOTP(totpCode, user.twoFactorSecret);
            if (!isValidTOTP) {
                return res.status(401).json({ message: 'Invalid 2FA code' });
            }
        }        // Generate tokens with minimal payload
        const accessToken = jwt.sign(
            { 
                uid: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '15m',
                audience: process.env.JWT_AUDIENCE || 'technest-api',
                issuer: process.env.JWT_ISSUER || 'technest'
            }
        );

        const refreshToken = jwt.sign(
            { 
                uid: user._id.toString(),
                version: user.tokenVersion // For invalidating all tokens if needed
            },
            process.env.REFRESH_TOKEN_SECRET,
            { 
                expiresIn: '7d',
                audience: process.env.JWT_AUDIENCE || 'technest-api',
                issuer: process.env.JWT_ISSUER || 'technest'
            }
        );

        // Set cookies with enhanced security
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true, // Always use secure in modern applications
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth/refresh', // Restrict refresh token to auth endpoints
            domain: process.env.COOKIE_DOMAIN || undefined
        });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        if (req.user) {
            // Increment token version to invalidate all existing tokens
            await req.user.incrementTokenVersion();
        }

        // Clear cookies with same options they were set with
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/auth/refresh',
            domain: process.env.COOKIE_DOMAIN || undefined
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
};

// Refresh access token
exports.refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                code: 'REFRESH_TOKEN_MISSING',
                message: 'No refresh token provided' 
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
                audience: process.env.JWT_AUDIENCE || 'technest-api',
                issuer: process.env.JWT_ISSUER || 'technest'
            });
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                res.clearCookie('refreshToken');
                return res.status(401).json({
                    code: 'REFRESH_TOKEN_EXPIRED',
                    message: 'Refresh token has expired. Please login again.'
                });
            }
            throw err;
        }

        const user = await User.findById(decoded.uid);

        if (!user || user.tokenVersion !== decoded.version) {
            res.clearCookie('refreshToken');
            return res.status(401).json({ 
                code: 'REFRESH_TOKEN_INVALID',
                message: 'Invalid refresh token' 
            });
        }

        const accessToken = jwt.sign(
            { 
                uid: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '15m',
                audience: process.env.JWT_AUDIENCE || 'technest-api',
                issuer: process.env.JWT_ISSUER || 'technest'
            }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};
