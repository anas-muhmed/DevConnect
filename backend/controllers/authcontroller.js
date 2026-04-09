const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

// =================== REGISTER ===================
exports.register = async (req, res) => {
  try {
    console.log('🔵 Register attempt - Received data:', {
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      passwordLength: req.body.password?.length
    });
    
    const { username, email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      displayName: name || username // Use name if provided, otherwise username
    });
    
    await newUser.save();
    console.log('✅ User registered successfully:', username);

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({
      message: "Server error while registering 😓",
      error: err.message,
    });
  }
};

// =================== LOGIN ===================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect email or password ❌" });
    }

    // 🎯 Generate tokens with appropriate lifespans
    const accessToken = JWT.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes - reasonable for security & UX
    );

    const refreshToken = JWT.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // 7 days - can extend sessions
    );

    // 🍪 Set httpOnly cookie for refresh token (secure storage)
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,              // JS can't access (XSS protection)
      secure: isProduction,        // HTTPS only in production
      sameSite: 'Lax',            // CSRF protection
      path: '/',                   // Available site-wide
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });
    
    console.log("🍪 Refresh token cookie set for user:", user.username);
    console.log("⏰ Access token expires in: 15 minutes");
    console.log("⏰ Refresh token expires in: 7 days");
    

    res.status(200).json({
      token: accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      message: "Login successful ✅",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while logging in", error: err.message });
  }
};

// =================== REFRESH TOKEN ===================
exports.refreshToken = async (req, res) => {
  try {
    console.log('🔄 Token refresh requested');
    console.log('📦 All cookies received:', Object.keys(req.cookies));
    
    const token = req.cookies.refreshToken;

    if (!token) {
      console.log("❌ No refresh token in cookies");
      return res.status(401).json({ 
        message: "No refresh token provided!",
        code: "NO_REFRESH_TOKEN"
      });
    }

    // Verify refresh token
    JWT.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        console.log("⛔ Refresh token verification failed:", err.message);
        
        // Clear invalid cookie
        res.clearCookie('refreshToken');
        
        return res.status(403).json({ 
          message: "Invalid or expired refresh token",
          code: "INVALID_REFRESH_TOKEN"
        });
      }

      // Verify user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("❌ User not found for token ID:", decoded.id);
        res.clearCookie('refreshToken');
        return res.status(404).json({ 
          message: "User not found",
          code: "USER_NOT_FOUND"
        });
      }

      // Generate new access token
      const newAccessToken = JWT.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      console.log("✅ Access token refreshed for:", user.username);

      res.status(200).json({
        token: newAccessToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email
        },
        message: "Token refreshed successfully"
      });
    });
  } catch (err) {
    console.error("💥 Error in refresh token endpoint:", err.message);
    res.status(500).json({
      message: "Server error during token refresh",
      code: "REFRESH_ERROR",
      error: err.message
    });
  }
};

// =================== LOGOUT ===================
exports.logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    
    // No token = no action needed
    if (!cookies?.refreshToken) {
      return res.status(204).send(); // 204 No Content
    }

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax", // Changed from Strict/None to Lax for better compatibility
      path: "/api/auth" // Explicit path matching
    });

    return res.status(200).json({ message: "Logout successful ✅" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};