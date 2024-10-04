import axios from "axios";

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
export const USERS_ENDPOINT = `users`
export const USER_POSTS_ENDPOINT = (userId) => `posts?userId=${userId}`
export const  COMMENTS_POSTS_ENDPOINT = (postId) =>`comments?postId=${postId}` 

const get = async (url) => {
    return axios.get(`${API_BASE_URL}/${url}`);
}

export const fetchAllUsers = async () => {
    return await get(USERS_ENDPOINT);
}

export const fetchUserPosts = async (userId) => {
    return await get(USER_POSTS_ENDPOINT(userId));
}

export const fetchAllComments = async (postId) =>{
    return await get(COMMENTS_POSTS_ENDPOINT(postId))
}