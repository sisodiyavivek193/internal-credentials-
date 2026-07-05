const mongoose = require("mongoose");

// Ek browser subscription = ek device/browser jahan user ne push notifications
// allow ki hain. Same user multiple devices se subscribe kar sakta hai, isliye
// endpoint ko unique rakha hai (ek endpoint = ek subscription).
const pushSubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
            unique: true,
        },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
        },
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.PushSubscription ||
    mongoose.model("PushSubscription", pushSubscriptionSchema);
