/**
 * Minimal structured logger.
 * Purpose: replace scattered console.log/console.error calls with a single
 * place that timestamps output and can later be swapped for a real logging
 * service (Winston, Pino, a hosted log drain, etc.) without touching every
 * controller.
 *
 * Usage:
 *   const logger = require("../utils/logger");
 *   logger.info("Server started", { port: 5000 });
 *   logger.error("Login failed", { email });
 */

const isProd = process.env.NODE_ENV === "production";

function timestamp() {
    return new Date().toISOString();
}

function format(level, message, meta) {
    const base = `[${timestamp()}] [${level}] ${message}`;
    if (meta && Object.keys(meta).length) {
        return `${base} ${JSON.stringify(meta)}`;
    }
    return base;
}

module.exports = {
    info(message, meta = {}) {
        console.log(format("INFO", message, meta));
    },
    warn(message, meta = {}) {
        console.warn(format("WARN", message, meta));
    },
    error(message, meta = {}) {
        console.error(format("ERROR", message, meta));
    },
    // Debug logs sirf development mein print honge, production console ko clean rakhne ke liye
    debug(message, meta = {}) {
        if (!isProd) {
            console.log(format("DEBUG", message, meta));
        }
    },
};
