const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");

// 🔎 Basic server-side email format check (frontend zod validation par hi depend nahi karna)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. ADD USER / REGISTER (With QR Code Logic)
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // 🔐 2FA Secret + OTP Auth URL generate karein
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `IG:${email}`, // Authenticator app mein ye naam dikhega
            issuer: "MyCompany"        // Header name
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role,
            twoFactorSecret: secret.base32,
            twoFactorEnabled: true
        });

        // Agar admin route se aaya hai to authMiddleware ne req.user set kiya hoga
        if (req.user) {
            await AuditLog.create({
                actorId: req.user.id,
                actorRole: req.user.role,
                action: "CREATE_USER",
                projectName: "New user: " + email + " (" + (role || "uiux") + ")",
                ip: req.headers['x-forwarded-for'] || req.ip,
                userAgent: req.headers["user-agent"],
            });
        }

        res.status(201).json({
            success: true,
            message: "User created successfully",
            qrCodeUrl: secret.otpauth_url,
            secret: secret.base32
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 2. LOGIN (Initial Credentials Check)
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });

        // Generic message hamesha same rakho, chahe email exist kare ya na kare
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 🔒 Account temporarily locked hai?
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(429).json({
                message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // ❌ Wrong password: failed attempts badhao
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                user.failedLoginAttempts = 0; // reset counter, lock is now active
                await user.save();
                return res.status(429).json({
                    message: "Too many failed attempts. Account locked for 15 minutes.",
                });
            }

            await user.save();
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ Correct password: counters reset karo
        if (user.failedLoginAttempts > 0 || user.lockUntil) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
            await user.save();
        }

        // 🔐 BY-DEFAULT 2FA CHECK
        return res.json({
            twoFactorRequired: true,
            userId: user._id,
            message: "Please enter code from your Authenticator App"
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 3. VERIFY 2FA (Final Step)
exports.verify2FA = async (req, res) => {
    try {
        const { userId, otpCode } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const isVerified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otpCode,
            window: 3 // 90 seconds buffer
        });

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid Authenticator Code" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        await AuditLog.create({
            actorId: user._id,
            actorRole: user.role,
            action: "LOGIN_SUCCESS_2FA",
            projectName: "System",
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // prod (HTTPS) mein true, dev mein false
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            role: user.role,
            email: user.email,
            message: "Login successful"
        });

    } catch (error) {
        console.error("2FA ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 4. LOGOUT
exports.logout = async (req, res) => {
    try {
        // Agar aapke paas authMiddleware se user info aa rahi hai
        if (req.user) {
            await AuditLog.create({
                actorId: req.user.id,
                actorRole: req.user.role,
                action: "LOGOUT_SUCCESS",
                projectName: "System",
                ip: req.ip,
                userAgent: req.headers["user-agent"],
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax"
        });

        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed" });
    }
};
