import React, { createContext, useState, useContext, useEffect } from 'react';
import { trackDetailedUserAction } from '../utils/analytics';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTimer, setRefreshTimer] = useState(null);

    // Function to refresh the access token
    const refreshAccessToken = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            // Token is set via httpOnly cookie, no need to handle it here
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, log out the user
            await logout();
            return false;
        }
    };

    // Setup token refresh interval
    const setupRefreshTimer = () => {
        // Refresh token 1 minute before it expires (14 minutes for 15-minute token)
        const refreshInterval = 14 * 60 * 1000;
        
        const timerId = setInterval(refreshAccessToken, refreshInterval);
        setRefreshTimer(timerId);
        
        return timerId;
    };

    useEffect(() => {
        // Initial auth check
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/check', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setupRefreshTimer();
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        return () => {
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
        };
    }, []);    const login = (userData) => {
        setUser(userData);
        sessionStorage.setItem('sessionId', Date.now().toString());
        setupRefreshTimer();
        
        // Track login event
        trackDetailedUserAction('user_login', {
            user_id: userData.id,
            user_role: userData.role,
            login_method: 'email'
        });
    };

    const logout = async () => {
        try {
            // Call logout endpoint to invalidate token
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Track logout event
        if (user) {
            trackDetailedUserAction('user_logout', {
                user_id: user.id,
                session_duration: Date.now() - parseInt(sessionStorage.getItem('sessionId'))
            });
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('sessionId');
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};