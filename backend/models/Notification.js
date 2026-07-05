const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // Kis user ko ye notification dikhni hai
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        // Example: CREDENTIAL_ADDED, CREDENTIAL_UPDATED
        type: {
            type: String,
            enum: ["CREDENTIAL_ADDED", "CREDENTIAL_UPDATED"],
            default: "CREDENTIAL_ADDED",
        },

        credentialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Credential",
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
