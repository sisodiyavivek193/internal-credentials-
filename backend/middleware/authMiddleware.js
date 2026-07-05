const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {

    // 📱 Pehle Authorization header check karo (Bearer token) — iOS Safari/Chrome
    // cross-site cookies block kar dete hain (ITP), isliye header-based auth fallback hai
    let token = req.cookies.token;
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        console.log("❌ NO TOKEN FOUND");
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔒 FIX: JWT sirf issue time ka snapshot hai — agar admin ne baad mein
        // is user ko revoke/delete/role-change kiya ho, purana token abhi bhi
        // valid dikhega jab tak hum DB se live status check na karein.
        const user = await User.findById(decoded.id).select("role isActive");

        if (!user) {
            console.log("❌ USER NOT FOUND (deleted?)");
            res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
            return res.status(401).json({ message: "Account no longer exists" });
        }

        if (!user.isActive) {
            console.log("❌ USER REVOKED — killing session");
            res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
            return res.status(401).json({ message: "Your account has been revoked" });
        }

        // req.user ko DB ke live role/isActive se refresh karo (JWT ke stale data pe depend mat karo)
        req.user = { id: decoded.id, role: user.role, isActive: user.isActive };
        next();
    } catch (error) {
        console.log("❌ JWT VERIFY FAILED:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};
