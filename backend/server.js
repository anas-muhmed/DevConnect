const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser=require('cookie-parser');

const authRoutes=require('./routes/auth');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profile');
const userRoutes=require('./routes/userRoutes')
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

//custom cors() for sharing cookiess
// Ensure your CORS middleware looks like this:
const allowedOrigins = ["http://127.0.0.1:5180"];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  // Dynamically set Access-Control-Allow-Origin to match the request's Origin
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});


// Handle cross-origin requests
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); //to read cookies efectively! 

// Routes
app.use("/api/auth", authRoutes); // Public (register/login)
app.use('/api/posts', postRoutes); //partially protected in postRoutes.js
app.use('/api/profile', authMiddleware, profileRoutes); // Protected
//app.use('/api/user',userRoutes);

// Serve static files from 'public/uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(error => console.error("❌ MongoDB connection error:", error));



app.listen(5000, '127.0.0.1', () => {
  console.log('Server running on http://127.0.0.1:5000');
});


