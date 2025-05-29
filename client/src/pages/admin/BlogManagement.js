import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const BlogManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        categories: '',
        tags: '',
        status: 'draft'
    });
    const [previewMode, setPreviewMode] = useState(false);
    const [featuredImage, setFeaturedImage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('/api/blog/admin');
            setPosts(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching blog posts');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFeaturedImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            if (featuredImage) {
                formDataToSend.append('featuredImage', featuredImage);
            }

            if (selectedPost) {
                await axios.put(`/api/blog/${selectedPost._id}`, formDataToSend);
            } else {
                await axios.post('/api/blog', formDataToSend);
            }

            // Reset form
            setFormData({
                title: '',
                content: '',
                excerpt: '',
                categories: '',
                tags: '',
                status: 'draft'
            });
            setFeaturedImage(null);
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            setError(error.response?.data?.error || 'Error saving blog post');
        }
    };

    const handleEdit = (post) => {
        setSelectedPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            categories: post.categories.join(', '),
            tags: post.tags.join(', '),
            status: post.status
        });
        setPreviewMode(false);
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await axios.delete(`/api/blog/${postId}`);
            fetchPosts();
        } catch (error) {
            setError('Error deleting blog post');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Blog Management</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Blog Post Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {selectedPost ? 'Edit Post' : 'Create New Post'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setPreviewMode(!previewMode)}
                            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Content</label>
                        {previewMode ? (
                            <div className="prose max-w-none border rounded p-4">
                                <ReactMarkdown>{formData.content}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="10"
                                required
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Excerpt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Categories</label>
                            <input
                                type="text"
                                name="categories"
                                value={formData.categories}
                                onChange={handleInputChange}
                                placeholder="Comma-separated categories"
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="Comma-separated tags"
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Featured Image</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4">
                        {selectedPost && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPost(null);
                                    setFormData({
                                        title: '',
                                        content: '',
                                        excerpt: '',
                                        categories: '',
                                        tags: '',
                                        status: 'draft'
                                    });
                                    setFeaturedImage(null);
                                }}
                                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {selectedPost ? 'Update Post' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Blog Posts List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b text-left">Title</th>
                                <th className="px-6 py-3 border-b text-left">Status</th>
                                <th className="px-6 py-3 border-b text-left">Date</th>
                                <th className="px-6 py-3 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post._id}>
                                    <td className="px-6 py-4 border-b">{post.title}</td>
                                    <td className="px-6 py-4 border-b">
                                        <span
                                            className={`px-2 py-1 rounded text-sm ${
                                                post.status === 'published'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="text-blue-500 hover:text-blue-700 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BlogManagement;
