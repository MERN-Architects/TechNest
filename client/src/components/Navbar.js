import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bars3Icon, 
    XMarkIcon, 
    ShoppingCartIcon,
    SunIcon, 
    MoonIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Search from './Search';

const Navbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const { getCartCount, setIsCartOpen } = useCart();
    const [navLinks, setNavLinks] = useState([]);    // Update navigation links when user changes
    useEffect(() => {
        setNavLinks(getNavLinks(user));
    }, [user]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleLogoClick = () => {
        navigate('/', { replace: true });
    };    const getNavLinks = (user) => {
        // Common links for all users (public pages)
        const commonLinks = [
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/services', label: 'Services' },
            { path: '/portfolio', label: 'Portfolio' },
            { path: '/blog', label: 'Blog' },
            { path: '/team', label: 'Team' },
            { path: '/contact', label: 'Contact' }
        ];

        if (!user) {
            return [...commonLinks];
        }

        // Links for authenticated users
        const authenticatedLinks = [
            { path: '/orders', label: 'Orders' },
            { path: '/profile', label: 'Profile' }
        ];

        if (user.role === 'admin') {
            return [
                ...commonLinks,
                ...authenticatedLinks,
                { path: '/admin/dashboard', label: 'Admin Dashboard' },
                { path: '/admin/overview', label: 'Analytics' },
                { path: '/admin/blog', label: 'Blog Management' },
                { path: '/test-connection', label: 'System Status' }
            ];
        }

        return [
            ...commonLinks,
            ...authenticatedLinks,
            { path: '/user/dashboard', label: 'Dashboard' }
        ];
    };

    const containerVariants = {
        hidden: { opacity: 0, y: -5 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    const mobileMenuVariants = {
        closed: { 
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2
            }
        },
        open: { 
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.07,
                delayChildren: 0.2
            }
        }
    };

    const menuItemVariants = {
        closed: { opacity: 0, x: -10 },
        open: { opacity: 1, x: 0 }
    };

    return (
        <motion.nav
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                scrollPosition > 0
                    ? isDarkMode
                        ? 'bg-gray-900/90 backdrop-blur-lg shadow-lg shadow-gray-900/10'
                        : 'bg-white/90 backdrop-blur-lg shadow-lg shadow-black/5'
                    : isDarkMode
                    ? 'bg-gray-900/50 backdrop-blur-sm'
                    : 'bg-white/50 backdrop-blur-sm'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <motion.div 
                            onClick={handleLogoClick}
                            className="flex items-center cursor-pointer mr-8"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <img 
                                src="/logo.png" 
                                alt="TechNest Logo" 
                                className="h-8 transition-transform"
                            />
                        </motion.div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <motion.div
                                    key={link.path}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        to={link.path}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                            location.pathname === link.path
                                                ? isDarkMode
                                                    ? 'text-primary-400 bg-primary-900/20'
                                                    : 'text-primary-600 bg-primary-50'
                                                : isDarkMode
                                                ? 'text-gray-300 hover:text-white hover:bg-white/5'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right side items */}
                    <div className="flex items-center space-x-4">
                        {/* Search component */}
                        <div className="hidden md:block w-64">
                            <Search />
                        </div>

                        {/* Cart */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                        >
                            <ShoppingCartIcon className="h-6 w-6" />
                            {getCartCount() > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                >
                                    {getCartCount()}
                                </motion.span>
                            )}
                        </motion.button>

                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'text-yellow-400 hover:bg-white/5' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {isDarkMode ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </motion.button>

                        {/* Mobile menu button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`md:hidden p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'text-gray-300 hover:bg-white/5' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={mobileMenuVariants}
                            className="md:hidden"
                        >
                            <div className={`py-4 px-4 space-y-2 rounded-lg shadow-lg mt-2 ${
                                isDarkMode 
                                    ? 'bg-gray-900/90 backdrop-blur-xl border border-gray-800/50' 
                                    : 'bg-white/90 backdrop-blur-xl border border-gray-200/50'
                            }`}>
                                {/* Mobile Search */}
                                <div className="mb-4">
                                    <Search />
                                </div>

                                {/* Mobile Navigation Links */}
                                {navLinks.map((link) => (
                                    <motion.div
                                        key={link.path}
                                        variants={menuItemVariants}
                                    >
                                        <Link
                                            to={link.path}
                                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                location.pathname === link.path
                                                    ? isDarkMode
                                                        ? 'text-primary-400 bg-primary-900/20'
                                                        : 'text-primary-600 bg-primary-50'
                                                    : isDarkMode
                                                    ? 'text-gray-300 hover:text-white hover:bg-white/5'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

export default Navbar;