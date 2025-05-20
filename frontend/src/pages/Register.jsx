import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axios'
import { toast } from 'react-toastify'

const Register = () => {

  const[formData,setFormData]=useState({
    name:'',
    username:'',
    email:'',
    password:'',
    confirmPassword:'',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  


  const handleSubmit=async(e)=>{
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

   try{
    const res=await axiosInstance.post('http://localhost:5000/api/auth/register',{
      name:formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })
    toast.success(res.data.message)

   }catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  }






  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name='name'
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <input
          type="text"
          onChange={handleChange}
          name='username'
          value={formData.username}
          placeholder="Username"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          name='email'
          onChange={handleChange}
          value={formData.email}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <input
        name='password'
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
         
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <input
          type="password"
          name='confirmPassword'
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  </div>
)
}

 

export default Register
