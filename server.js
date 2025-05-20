const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser=require('cookie-parser');

const authRoutes=require('./routes/auth');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profile');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

//custom cors() for sharing cookiess
// Ensure your CORS middleware looks like this:
app.use(cors({
  origin: "http://localhost:5180",
  credentials: true,
  exposedHeaders: ['set-cookie'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:5180');
  next();
});



// Handle cross-origin requests
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); //to read cookies efectively! 

// Routes
app.use("/api/auth", authRoutes); // Public (register/login)
app.use('/api/posts', postRoutes); //partially protected in postRoutes.jsx
app.use('/api/profile', authMiddleware, profileRoutes); // Protected

// Serve static files from 'public/uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(error => console.error("❌ MongoDB connection error:", error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

