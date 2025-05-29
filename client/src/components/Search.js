import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import debounce from 'lodash/debounce';

const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        blogs: [],
        services: [],
        portfolio: [],
        courses: []
    });
    const [suggestions, setSuggestions] = useState([]);

    const fetchSuggestions = async (searchQuery) => {
        try {
            const response = await axios.get(`/api/search/suggestions?query=${searchQuery}`);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const debouncedFetchSuggestions = useCallback(
        debounce(fetchSuggestions, 300),
        []
    );

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults({
                blogs: [],
                services: [],
                portfolio: [],
                courses: []
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/search?query=${searchQuery}`);
            setResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce(handleSearch, 500),
        []
    );

    useEffect(() => {
        if (query.trim()) {
            debouncedSearch(query);
            debouncedFetchSuggestions(query);
        }
    }, [query]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setShowResults(!!value);
    };

    const handleItemClick = (type, item) => {
        setShowResults(false);
        setQuery('');
        
        switch (type) {
            case 'blogs':
                navigate(`/blog/${item.slug}`);
                break;
            case 'services':
                navigate(`/services/${item.slug}`);
                break;
            case 'portfolio':
                navigate(`/portfolio/${item.slug}`);
                break;
            case 'courses':
                navigate(`/courses/${item.slug}`);
                break;
            default:
                break;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowResults(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search courses, blogs, services..."
                    className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </span>
            </form>

            {showResults && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : (
                        <div>
                            {/* Courses */}
                            {results.courses?.length > 0 && (
                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Courses</h3>
                                    {results.courses.map((course) => (
                                        <button
                                            key={course._id}
                                            onClick={() => handleItemClick('courses', course)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center"
                                        >
                                            {course.thumbnail && (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-10 h-10 object-cover rounded mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {course.shortDescription}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Blogs */}
                            {results.blogs?.length > 0 && (
                                <div className="p-4 border-t">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Blog Posts</h3>
                                    {results.blogs.map((blog) => (
                                        <button
                                            key={blog._id}
                                            onClick={() => handleItemClick('blogs', blog)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                                        >
                                            <div className="font-medium">{blog.title}</div>
                                            <div className="text-sm text-gray-500">
                                                {blog.excerpt?.substring(0, 100)}...
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Services */}
                            {results.services?.length > 0 && (
                                <div className="p-4 border-t">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Services</h3>
                                    {results.services.map((service) => (
                                        <button
                                            key={service._id}
                                            onClick={() => handleItemClick('services', service)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center"
                                        >
                                            {service.icon && (
                                                <span className="text-2xl mr-3">{service.icon}</span>
                                            )}
                                            <div>
                                                <div className="font-medium">{service.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {service.shortDescription}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Portfolio */}
                            {results.portfolio?.length > 0 && (
                                <div className="p-4 border-t">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Portfolio</h3>
                                    {results.portfolio.map((item) => (
                                        <button
                                            key={item._id}
                                            onClick={() => handleItemClick('portfolio', item)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center"
                                        >
                                            {item.featuredImage && (
                                                <img
                                                    src={item.featuredImage}
                                                    alt={item.title}
                                                    className="w-10 h-10 object-cover rounded mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{item.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {item.shortDescription}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {Object.values(results).every(arr => !arr?.length) && query && (
                                <div className="p-4 text-center text-gray-500">
                                    No results found for "{query}"
                                </div>
                            )}

                            {/* View All Results */}
                            {Object.values(results).some(arr => arr?.length > 0) && (
                                <button
                                    onClick={handleSubmit}
                                    className="w-full p-4 text-center text-blue-600 hover:bg-gray-50 border-t"
                                >
                                    View all results
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
