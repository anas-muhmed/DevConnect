import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import ProfilePage from "./pages/ProfilePage";
import PostDetail from "./pages/PostDetails"; 
import CreatePost from "./pages/CreatePost";
import ComingSoonPage from "./pages/ComingSoonPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/profile" element={<Profile />} /> {/*viewing own profile*/}
            <Route path="/profile/:username" element={<ProfilePage/>}/> {/*viewing other users profile*/}
            <Route path="/posts/:id" element={<PostDetail />} /> 
            <Route path="/create" element={<CreatePost />} />
            <Route path="/communities" element={<ComingSoonPage feature="Communities" />} />
            <Route path="/explore" element={<ComingSoonPage feature="Explore" />} />
             <Route path="/notifications" element={<ComingSoonPage feature="Notifications" />} /> 
             <Route path="/saved" element={<ComingSoonPage feature="Saved Posts" />} />
             <Route path="/discussions" element={<ComingSoonPage feature="Discussions" />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </BrowserRouter>
  );
};

export default App;
