import axiosInstance from '../api/axios';

export const followUser=async (userId)=>{
    return axiosInstance.put(`/users/${userId}/follow`);
}

export const unfollowUser=async (userId)=>{
    return axiosInstance.put(`/users/${userId}/unfollow`);
}