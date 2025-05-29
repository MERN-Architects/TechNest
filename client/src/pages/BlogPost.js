import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);

    const fetchPost = useCallback(async () => {
        try {
            const [postResponse, relatedResponse] = await Promise.all([
                axios.get(`/api/blog/${slug}`),
                axios.get(`/api/blog/related/${slug}`)
            ]);

            setPost(postResponse.data);
            setRelatedPosts(relatedResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blog post:', error);
            setError('Failed to load blog post');
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">{error || 'Blog post not found'}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <article className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <span>By {post.author.name}</span>
                        <span>•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.readTime} min read</span>
                    </div>
                    {post.featuredImage && (
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-96 object-cover rounded-lg"
                        />
                    )}
                </header>

                {/* Content */}
                <div className="prose max-w-none mb-12">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Tags and Categories */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((category) => (
                            <Link
                                key={category}
                                to={`/blog?category=${category}`}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="border-t pt-8">
                        <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost._id}
                                    to={`/blog/${relatedPost.slug}`}
                                    className="group"
                                >
                                    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                                        {relatedPost.featuredImage && (
                                            <img
                                                src={relatedPost.featuredImage}
                                                alt={relatedPost.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold group-hover:text-blue-600">
                                                {relatedPost.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-2">
                                                {relatedPost.excerpt}
                                            </p>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
};

export default BlogPost;
