const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        actorRole: {
            type: String,
            enum: ["admin", "uiux", "seo", "developer"],
            required: true,
            index: true,
        },

        credentialIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Credential"
        }],

        projectName: {
            type: String,
            trim: true,
            default: "N/A"
        },

        // 🔥 Actual action
        action: {
            type: String,
            required: true,
            index: true,
            // Example: ADD, UPDATE, DELETE, PASSWORD_COPY, BULK_DELETE
        },

        // 🌐 Security & Metadata
        ip: String,
        userAgent: String,
    },
    { timestamps: true }
);

// Search optimize karne ke liye Compound Index (Optional but Recommended)
auditLogSchema.index({ actorId: 1, createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);