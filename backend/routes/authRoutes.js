const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// ✅ Sab kuch sahi se import karein
const { login, logout, verify2FA, register } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔒 IP-level rate limit: har IP se max 10 login attempts / 15 minutes
// Isse automated brute-force scripts multiple emails try nahi kar payenge
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts from this device. Please try again after 15 minutes." },
});

// 🔒 2FA verify pe bhi rate limit (OTP brute-force se bachne ke liye)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many verification attempts. Please try again after 15 minutes." },
});

// LOGIN (Step 1: Email/Password Check)
router.post("/login", loginLimiter, login);

// ✅ VERIFY 2FA (Step 2: Authenticator Code Check)
router.post("/verify-2fa", otpLimiter, verify2FA);

// LOGOUT
router.post("/logout", authMiddleware, logout);

// ✅ REGISTER - Yahan galti thi! Ab ye 'register' direct use hoga
router.post("/register", register);

// ME
router.get("/me", authMiddleware, (req, res) => {
    res.json({
        role: req.user.role,
        id: req.user.id,
    });
});

module.exports = router;
