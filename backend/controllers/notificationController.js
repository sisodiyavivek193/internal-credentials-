const Notification = require("../models/Notification");
const PushSubscription = require("../models/PushSubscription");
const { VAPID_PUBLIC_KEY } = require("../utils/webpush");

/**
 * GET /api/notifications
 * Logged-in user ke saare notifications (newest first, paginated)
 */
exports.getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ recipientId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ recipientId: req.user.id }),
            Notification.countDocuments({ recipientId: req.user.id, isRead: false }),
        ]);

        res.json({
            data: notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/notifications/unread-count
 * Sirf badge count ke liye — lightweight poll-able endpoint
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipientId: req.user.id,
            isRead: false,
        });
        res.json({ unreadCount });
    } catch (error) {
        console.error("UNREAD COUNT ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user.id },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Marked as read", notification });
    } catch (error) {
        console.error("MARK READ ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("MARK ALL READ ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * DELETE /api/notifications/:id
 * Sirf apna hi notification delete kar sakta hai (recipientId match zaroori)
 */
exports.deleteOne = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipientId: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * DELETE /api/notifications
 * Logged-in user ke saare notifications clear kar do
 */
exports.deleteAll = async (req, res) => {
    try {
        await Notification.deleteMany({ recipientId: req.user.id });
        res.json({ message: "All notifications deleted" });
    } catch (error) {
        console.error("DELETE ALL NOTIFICATIONS ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/notifications/vapid-public-key
 * Frontend ko push subscribe karne ke liye public key chahiye — koi auth
 * secret nahi hai ye, safe hai bina login ke bhi dena, lekin humne route
 * authMiddleware ke peeche hi rakha hai consistency ke liye.
 */
exports.getVapidPublicKey = (req, res) => {
    if (!VAPID_PUBLIC_KEY) {
        return res.status(503).json({ message: "Push notifications not configured on server" });
    }
    res.json({ publicKey: VAPID_PUBLIC_KEY });
};

/**
 * POST /api/notifications/subscribe
 * Browser se aayi push subscription (endpoint + keys) DB mein save/update karo
 */
exports.subscribe = async (req, res) => {
    try {
        const { endpoint, keys } = req.body || {};

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ message: "Invalid subscription payload" });
        }

        await PushSubscription.findOneAndUpdate(
            { endpoint },
            { userId: req.user.id, endpoint, keys },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ message: "Subscribed to push notifications" });
    } catch (error) {
        console.error("PUSH SUBSCRIBE ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /api/notifications/unsubscribe
 * User ne browser mein notifications off ki — subscription DB se hata do
 */
exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body || {};
        if (!endpoint) return res.status(400).json({ message: "endpoint is required" });

        await PushSubscription.deleteOne({ endpoint, userId: req.user.id });
        res.json({ message: "Unsubscribed" });
    } catch (error) {
        console.error("PUSH UNSUBSCRIBE ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
