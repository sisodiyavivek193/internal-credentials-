const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("./middleware/sanitize");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const logger = require("./utils/logger");

// Load Environment Variables
dotenv.config();
connectDB();

const app = express();

// Behind a reverse proxy (nginx, etc.) in production so req.ip / secure cookies work correctly
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

/* === SECURITY HEADERS (helmet) === */
app.use(helmet());

/* === NOSQL INJECTION SANITIZATION === */
// Removes any keys starting with '$' or containing '.' from req.body/query/params
app.use(mongoSanitize);

/* === CORS ===
   Default dev origins hardcoded rehte hain as a fallback, lekin production domain
   ko .env se ALLOWED_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com" set karke
   add karna chahiye — source code mein hardcode karna production ke liye sahi nahi hai. */
const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://192.168.1.7:3000",
    "http://192.168.1.7:5173",
];
const envOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: [...new Set([...defaultOrigins, ...envOrigins])],
    credentials: true,
}));

/* === STATIC FRONTEND SERVE === */
app.use(express.static(path.join(__dirname, "client"))); // yaha tera frontend build hoga


/* === API ROUTES === */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin/users", require("./routes/adminUserRoutes"));
app.use("/api/admin/credentials", require("./routes/credentialRoutes"));
app.use("/api/admin/audit-logs", require("./routes/auditRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api", require("./routes/credentialUserRoutes"));

/* === SPA FALLBACK (React / Vite) === */
// SPA fallback (avoid matching /api)
app.get(/^((?!\/api).)*$/, (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});


/* === SERVER START === */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
});
