const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

// =================== REGISTER ===================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (err) {
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

    const accessToken = JWT.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );

    const refreshToken = JWT.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set cookie securely based on environment
    const isProduction = process.env.NODE_ENV === "production";

    console.log("✅ Setting refreshToken cookie:", refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,           // OK for localhost
      sameSite: 'Lax',         // ✅ Use Lax for local dev!
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    

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
    console.log('All incoming cookies:', req.cookies);
    const token = req.cookies.refreshToken;

    console.log("👉 Refresh Token from Cookie:", token);

    if (!token) {
      return res.status(401).json({ message: "No refresh token provided!" });
    }

    JWT.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        console.log("⛔ JWT verification failed:", err.message);
        return res.status(403).json({ message: "Invalid or expired refresh token ⛔" });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("❌ No user found for refresh token ID:", decoded.id);
        return res.status(404).json({ message: "User not found ❌" });
      }

      const newAccessToken = JWT.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log("✅ Access token refreshed for:", user.username);

      res.status(200).json({
        token: newAccessToken,
        message: "Access token refreshed ✅",
      });
    });
  } catch (err) {
    console.error("💥 Error while refreshing token:", err.message);
    res.status(500).json({
      message: "Error while refreshing access token 😓",
      error: err.message,
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