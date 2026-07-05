const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "uiux", "seo", "developer"],
            default: "uiux",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // 🔥 Aapki requirement: By default ON rahega
        twoFactorEnabled: {
            type: Boolean,
            default: true,
        },
        // 🔥 Ye har user ke liye compulsory hai login ke liye
        twoFactorSecret: {
            type: String,
            required: true, // Base32 secret must be there
        },
        // 🔒 Brute-force protection: wrong password count + temporary lock
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null,
        },
        // 🔄 Refresh token support: silent re-login without full password+2FA every time
        refreshTokenHash: {
            type: String,
            default: null,
        },
        refreshTokenExpiresAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);