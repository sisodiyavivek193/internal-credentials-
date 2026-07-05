const webpush = require("web-push");
const logger = require("./logger");
const PushSubscription = require("../models/PushSubscription");

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

const isConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (isConfigured) {
    webpush.setVapidDetails(
        VAPID_SUBJECT || "mailto:admin@example.com",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
} else {
    // Push simply won't fire until keys are added — rest of the app works fine either way.
    logger.info("Web Push not configured (missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY in .env)");
}

/**
 * Sirf browser tab open honi chahiye ye zaroori nahi — service worker background
 * mein bhi push receive kar leta hai. Dead/expired subscriptions (410/404) ko
 * DB se khud hi clean kar deta hai.
 *
 * @param {string} userId
 * @param {{ title: string, message: string, notificationId?: string, credentialId?: string }} payload
 */
async function sendPushToUser(userId, payload) {
    if (!isConfigured) return;

    try {
        const subscriptions = await PushSubscription.find({ userId });
        if (!subscriptions.length) return;

        const body = JSON.stringify({
            title: payload.title,
            message: payload.message,
            notificationId: payload.notificationId,
            credentialId: payload.credentialId,
        });

        await Promise.all(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
                        },
                        body
                    );
                } catch (err) {
                    // 404/410 = subscription expired ya browser se unregister ho gayi
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await PushSubscription.deleteOne({ _id: sub._id });
                    } else {
                        logger.error(`Push send failed for ${sub._id}: ${err.message}`);
                    }
                }
            })
        );
    } catch (err) {
        logger.error("sendPushToUser error: " + err.message);
    }
}

/**
 * @param {string[]} userIds
 * @param {{ title: string, message: string, notificationId?: string, credentialId?: string }} payload
 */
async function sendPushToUsers(userIds, payload) {
    if (!isConfigured || !userIds?.length) return;
    await Promise.all(userIds.map((id) => sendPushToUser(id, payload)));
}

module.exports = { isConfigured, sendPushToUser, sendPushToUsers, VAPID_PUBLIC_KEY };
