import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import { IoEyeSharp } from "react-icons/io5";
import {
    API_BASE_URL,
    COMMENTS_POSTS_ENDPOINT,
    fetchAllComments,
    fetchAllUsers,
    fetchUserPosts,
    USER_POSTS_ENDPOINT,
    USERS_ENDPOINT
} from '../services/api.services';

const APIDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', body: '', userId: null });
    const [isLoading, setLoading] = useState({ users: false, posts: false, comments: false });
    const [error, setError] = useState(null);
    const [workflow, setWorkflow] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalComments, setModalComments] = useState([]);
    const [isCommetsModalOpen, setIsCommetsModalOpen] = useState(false);

    useEffect(() => {
        if (!users.length) {
            fetchUsers();
        }
    }, [users.length]);

    const fetchUsers = async () => {
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const { data } = await fetchAllUsers();
            setUsers(data);
            setWorkflow([{ api: `GET /${USERS_ENDPOINT}`, data }]);
            setLoading(prev => ({ ...prev, users: false }));
            setError(null);
        } catch (error) {
            console.log(error);
            setError("Failed to fetch Users: " + error.message);
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    const fetchPosts = async (userId) => {
        if (!userId) return;
        setLoading(prev => ({ ...prev, posts: true }));

        try {
            const { data } = await fetchUserPosts(userId);
            setPosts(data);
            setWorkflow(prev => [...prev, { api: `GET /${USER_POSTS_ENDPOINT(userId)}`, data }]);
            setLoading(prev => ({ ...prev, posts: false }));
        } catch (error) {
            setError("Failed to fetch Posts");
        } finally {
            setLoading(prev => ({ ...prev, posts: false }));
        }
    };

    const createPost = async () => {
        setLoading(prev => ({ ...prev, posts: true }));
        const transformedPost = { ...newPost, title: newPost.title.toUpperCase() };
        try {
            const response = await axios.post(`${API_BASE_URL}/posts`, transformedPost);
            setPosts([...posts, response.data]);
            setWorkflow(prev => [...prev, { api: 'POST /posts', data: response.data }]);
            setNewPost({ title: '', body: "", userId: null });
            setIsModalOpen(false);
            setLoading(prev => ({ ...prev, posts: false }));
        } catch (error) {
            setError("Failed to create a post");
            setLoading(prev => ({ ...prev, posts: false }));
        }
    };


    const fetchComments = async (postId) => {
        setLoading(prev => ({ ...prev, comments: true }));
        try {
            const { data } = await fetchAllComments(postId);
            setWorkflow(prev => [...prev, { api: `GET /${COMMENTS_POSTS_ENDPOINT(postId)}`, data }]);
            setModalComments(data);
            setIsCommetsModalOpen(true);
            setLoading(prev => ({ ...prev, comments: false }));
        } catch (error) {
            setError("Failed to fetch comments");
            setLoading(prev => ({ ...prev, comments: false }));
        }
    };

    return (
        <div className="container font-DM mx-auto p-6">
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-3">API Chaining Dashboard</h1>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

            <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">API Workflow</h2>
                <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {workflow.map((step, index) => (
                        <div key={index} className="flex p-2 items-center mb-2 bg-white rounded-lg shadow-md">

                            <div>
                                <div className="text-gray-700 text-xs font-medium">{step.api}</div>
                                <div className="text-gray-500 text-xs">Response Data Length: {step.data.length}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

            {/* User Selection and Posts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 mt-3'>
                {/* Select a User Card */}
                <div className="bg-indigo-500 h-full sm:h-full p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-6">Select a User</h2>
                    {isLoading.users ? (
                        <div className="flex justify-center">
                            <FaSpinner className="animate-spin text-white text-xl" />
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {users.map(user => (
                                <li
                                    key={user.id}
                                    onClick={async () => {
                                        setSelectedUserId(user.id);
                                        await fetchPosts(user.id);
                                    }}
                                    className={`cursor-pointer flex justify-start p-3 rounded-lg bg-white transition-all transform hover:scale-105 ${selectedUserId === user.id ? 'ring-4 ring-indigo-300' : 'shadow-md'}`}
                                >
                                    <div className='text-left'>
                                        <div className="text-sm font-bold text-gray-800">{user.name}</div>
                                        <div className="text-gray-500 text-[11px]">{user.email}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Posts Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-[500px] overflow-y-auto">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6">Posts</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-800 transition-all text-sm flex items-center'
                        >
                            <FaPlus className='mr-2 ' />
                            Create a Post
                        </button>
                    </div>

                    {isLoading.posts ? (
                        <div className="flex justify-center items-center h-40">
                            <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {posts.length > 0 ? posts.map(post => (
                                <div
                                    key={post.id}
                                    className={`bg-white rounded-lg border shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all transform hover:scale-105`}
                                >
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">{post.title.length > 0 ? `${post.title.substring(0, 20)}...` : post.title}</h3>
                                    <p className="text-gray-800 text-[12px]">
                                        {post.body.length > 100 ? `${post.body.substring(0, 100)}...` : post.body}
                                    </p>

                                    <div
                                        onClick={() => fetchComments(post.id)}
                                        className="mt-1 text-indigo-500 flex gap-2 items-center cursor-pointer"
                                    >
                                        <span className="flex text-sm items-center gap-2">
                                            View Comments <IoEyeSharp />
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-500 text-sm text-center">
                                    Select user to view the post or create a post
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>


            {/* Comments Modal */}
            <AnimatePresence>
                {isCommetsModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}  
                            animate={{ opacity: 1, scale: 1 }}   
                            exit={{ opacity: 0, scale: 0.8 }}   
                            transition={{ duration: 0.3, ease: "easeInOut" }}  
                            className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3"
                        >
                            <h2 className="text-lg font-semibold mb-4">Comments</h2>
                            <ul className="space-y-1 text-[9px]">
                                {modalComments.length ? (
                                    modalComments.map((comment) => (
                                        <li key={comment.id} className="border p-2 rounded-lg">
                                            <p className="">{comment.body}</p>
                                            <div className="mt-2 text-[10px] font-semibold">
                                                {comment.email}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p>No comments available.</p>
                                )}
                            </ul>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setIsCommetsModalOpen(false)}
                                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Post Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}  
                            animate={{ opacity: 1, scale: 1 }}   
                            exit={{ opacity: 0, scale: 0.8 }}     
                            transition={{ duration: 0.3, ease: "easeInOut" }}  
                            className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3"
                        >
                            <h2 className="text-lg font-semibold mb-4">Create a Post</h2>
                            <input
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 p-4 border border-gray-200 mb-4"
                                type="text"
                                placeholder="Post Title"
                            />
                            <textarea
                                value={newPost.body}
                                onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                                className="w-full text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 p-4 border border-gray-200 mb-4"
                                rows={4}
                                placeholder="Post Body"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={createPost}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-800 transition-all"
                                >
                                    Create Post
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg ml-2 hover:bg-red-600 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default APIDashboard;
