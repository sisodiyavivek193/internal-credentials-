const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
    getVapidPublicKey,
    subscribe,
    unsubscribe,
} = require("../controllers/notificationController");

// GET all notifications for the logged-in user
router.get("/", authMiddleware, getMyNotifications);

// GET lightweight unread count (for polling the bell badge)
router.get("/unread-count", authMiddleware, getUnreadCount);

// PATCH mark all as read (must be before "/:id/read" to avoid conflicts — this is a fixed path so it's fine either way)
router.patch("/read-all", authMiddleware, markAllAsRead);

// PATCH mark single notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// DELETE all notifications (must be before "/:id" to avoid conflicts)
router.delete("/", authMiddleware, deleteAll);

// DELETE single notification
router.delete("/:id", authMiddleware, deleteOne);

/* === BROWSER PUSH NOTIFICATIONS === */
router.get("/push/vapid-public-key", authMiddleware, getVapidPublicKey);
router.post("/push/subscribe", authMiddleware, subscribe);
router.post("/push/unsubscribe", authMiddleware, unsubscribe);

module.exports = router;
