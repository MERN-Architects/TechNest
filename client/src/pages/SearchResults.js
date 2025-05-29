import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    
    const [results, setResults] = useState({
        blogs: [],
        services: [],
        portfolio: [],
        courses: []
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        blogs: {
            category: '',
            tags: [],
            dateRange: {
                start: null,
                end: null
            }
        },
        services: {
            category: ''
        },
        portfolio: {
            technologies: []
        },
        courses: {
            category: '',
            level: ''
        }
    });

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/search/advanced', {
                query,
                type,
                filters
            });
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    }, [query, type, filters]);

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query, fetchResults]);

    const handleFilterChange = (category, filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [filterType]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Search Results</h1>
                <p className="text-gray-600">
                    Showing results for "{query}"
                    {type && <span> in {type}</span>}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Filters</h2>

                        {/* Blog Filters */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Blog Categories</h3>
                            <select
                                value={filters.blogs.category}
                                onChange={(e) => handleFilterChange('blogs', 'category', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">All Categories</option>
                                <option value="technology">Technology</option>
                                <option value="programming">Programming</option>
                                <option value="design">Design</option>
                                <option value="business">Business</option>
                            </select>
                        </div>

                        {/* Course Filters */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Course Level</h3>
                            <select
                                value={filters.courses.level}
                                onChange={(e) => handleFilterChange('courses', 'level', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">All Levels</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Service Categories */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Service Categories</h3>
                            <select
                                value={filters.services.category}
                                onChange={(e) => handleFilterChange('services', 'category', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">All Categories</option>
                                <option value="web">Web Development</option>
                                <option value="app">Mobile Development</option>
                                <option value="ai">AI & Machine Learning</option>
                                <option value="cybersecurity">Cybersecurity</option>
                                <option value="marketing">Digital Marketing</option>
                                <option value="cloud">Cloud Services</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-3">
                    {/* Courses */}
                    {results.courses?.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Courses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.courses.map((course) => (
                                    <Link
                                        key={course._id}
                                        to={`/courses/${course.slug}`}
                                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                    >
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                                            <p className="text-gray-600 mb-4">{course.shortDescription}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">
                                                    {course.instructor.name}
                                                </span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    ${course.price}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Blog Posts */}
                    {results.blogs?.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Blog Posts</h2>
                            <div className="space-y-6">
                                {results.blogs.map((post) => (
                                    <Link
                                        key={post._id}
                                        to={`/blog/${post.slug}`}
                                        className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="mr-4">{post.category}</span>
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services */}
                    {results.services?.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.services.map((service) => (
                                    <Link
                                        key={service._id}
                                        to={`/services/${service.slug}`}
                                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="text-3xl mb-4">{service.icon}</div>
                                        <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                                        <p className="text-gray-600">{service.shortDescription}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Portfolio Items */}
                    {results.portfolio?.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.portfolio.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={`/portfolio/${item.slug}`}
                                        className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <img
                                            src={item.featuredImage}
                                            alt={item.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                            <p className="text-gray-600">{item.shortDescription}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {Object.values(results).every(arr => !arr?.length) && (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-semibold mb-4">No results found</h2>
                            <p className="text-gray-600">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
