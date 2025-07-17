import axiosInstance from "./axios";

export const votePost=async(postId,action)=>{
      const res= await axiosInstance.post(`/posts/${postId}/vote`, { action }); // ✅ correct

           return res.data;
}