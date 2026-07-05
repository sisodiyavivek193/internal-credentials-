
const mongoose = require("mongoose");

// Credential Detail ke liye chota schema
const loginDetailSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
});

const credentialSchema = new mongoose.Schema(
    {
        projectName: {
            type: String,
            required: true,
        },
        projectUrl: {
            type: String,
            required: true,
        },
        // ✅ AB YE ARRAY HAI (Multi-Credentials)
        credentials: [loginDetailSchema],

        projectNotes: {
            type: String,
            default: "",
        },
        roles: {
            type: [String],
            enum: ["admin", "uiux", "seo", "developer"],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Credential", credentialSchema);
