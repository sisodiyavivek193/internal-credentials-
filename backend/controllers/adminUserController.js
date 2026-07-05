const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const speakeasy = require("speakeasy"); // 2FA
const QRCode = require("qrcode"); // 2FA QR image
const APIFeatures = require("../utils/APIFeatures");

/**
 * Helper: Centralized audit logging for user-management actions.
 * (credentialController mein already ye pattern hai, yahan bhi missing tha)
 */
async function createUserAudit(req, targetLabel, action) {
    try {
        await AuditLog.create({
            actorId: req.user.id,
            actorRole: req.user.role,
            projectName: targetLabel || "User Management",
            action,
            ip: req.headers['x-forwarded-for'] || req.ip,
            userAgent: req.headers["user-agent"],
        });
    } catch (err) {
        console.error("USER AUDIT LOG ERROR:", err.message);
    }
}

/**
 * =========================
 * ADMIN: CREATE USER
 * =========================
 */

exports.createUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password and role are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // 🔐 1. 2FA Secret Generate Karein (By-Default ON)
        // 'name' mein aap apni company ka naam likh sakte hain jo user ke app mein dikhega
        const secret = speakeasy.generateSecret({
            name: `IG (${email})`
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔐 2. Save User with Secret
        const newUser = await User.create({
            email,
            password: hashedPassword,
            role,
            isActive: true,
            twoFactorSecret: secret.base32, // 👈 DB mein base32 format save karein
            twoFactorEnabled: true          // 👈 Hamesha true rahega
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                _id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                // 🔥 Ye Manual Key Admin user ko dega taaki wo Authenticator App mein add kar sake
                twoFactorSecret: secret.base32
            },
        });
    } catch (error) {
        console.error("CREATE USER ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * =========================
 * ADMIN: GET USER BY ID
 * =========================
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("GET USER BY ID ERROR:", error);
        return res.status(500).json({
            message: "Server error while fetching user",
        });
    }
};

/**
 * =========================
 * ADMIN: GET USER 2FA QR CODE
 * (Existing user ke stored twoFactorSecret se dobara QR generate karta hai)
 * =========================
 */
exports.getUserQRCode = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("email twoFactorSecret twoFactorEnabled");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({
                message: "2FA secret not set for this user",
            });
        }

        // 🔐 Stored base32 secret se otpauth:// URL dobara banao
        const otpauthUrl = speakeasy.otpauthURL({
            secret: user.twoFactorSecret,
            label: `IG:${user.email}`,
            issuer: "MyCompany",
            encoding: "base32",
        });

        // 🔐 QR code ko base64 image (data URL) me convert karo
        const qrCodeImage = await QRCode.toDataURL(otpauthUrl);

        return res.status(200).json({
            email: user.email,
            qrCodeImage,       // 👈 Frontend <img src={qrCodeImage} /> me directly use karega
            secret: user.twoFactorSecret, // manual entry ke liye backup
        });
    } catch (error) {
        console.error("GET USER QR CODE ERROR:", error);
        return res.status(500).json({
            message: "Server error while generating QR code",
        });
    }
};


/**
 * =========================
 * ADMIN: GET ALL USERS
 * =========================
 */
// controllers/userController.js

// exports.getAllUsers = async (req, res) => {
//     try {

//         const users = await User.find();
//         console.log("🚀 ~ users:", users);

//         return res.status(200).json({
//             data: usersWithStats
//         });


//     } catch (error) {
//         console.error("GET USERS ERROR:", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// };



exports.getAllUsers = async (req, res) => {
    try {
        // Query parameters se values lena
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Total users count (Pagination info ke liye)
        const totalUsers = await User.countDocuments();

        const usersWithStats = await User.aggregate([
            { $sort: { createdAt: -1 } }, // 👈 NEWEST FIRST (name field exist hi nahi karta User model me)
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "auditlogs",
                    localField: "_id",
                    foreignField: "actorId",
                    as: "auditData"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    isActive: 1,
                    createdAt: 1,
                    totalActions: { $size: "$auditData" },
                    lastActive: { $max: "$auditData.createdAt" }
                }
            }
        ]);

        // Aapka bataya hua exact response format
        return res.status(200).json({
            success: true,
            data: usersWithStats,
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        console.error("GET USERS ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


// exports.getAllUsers = async (req, res) => {
//     try {

//         const users = await User.find();
//         console.log("🚀 ~ users:", users);

//         const usersWithStats = await User.aggregate([
//             {
//                 $lookup: {
//                     from: "auditlogs",
//                     localField: "_id",
//                     foreignField: "actorId",
//                     as: "auditData"
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     name: 1,
//                     email: 1,
//                     role: 1,
//                     createdAt: 1,
//                     totalActions: { $size: "$auditData" },
//                     lastActive: { $max: "$auditData.createdAt" }
//                 }
//             },
//             { $sort: { name: 1 } }
//         ]);

//         return res.status(200).json({
//             data: usersWithStats
//         });


//     } catch (error) {
//         console.error("GET USERS ERROR:", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// };




// exports.getAllUsers = async (req, res) => {
//     try {
//         console.log("👉 GET /admin/users (with Audit Stats) HIT");

//         const usersWithStats = await User.aggregate([
//             {
//                 $lookup: {
//                     from: "auditlogs",
//                     localField: "_id",
//                     foreignField: "actorId",
//                     as: "auditData"
//                 }
//             },
//             {
//                 $project: {
//                     // ✅ Sirf wahi fields likho jo chahiye (Include = 1)
//                     // Password ko yahan mat likho, wo apne aap hat jayega
//                     _id: 1,
//                     name: 1,
//                     email: 1,
//                     role: 1,
//                     totalActions: { $size: "$auditData" },
//                     lastActive: { $max: "$auditData.createdAt" }
//                 }
//             },
//             { $sort: { name: 1 } }
//         ]);

//         return res.status(200).json(usersWithStats);
//     } catch (error) {
//         console.error("❌ GET USERS ERROR:", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// };


/**
 * =========================
 * ADMIN: UPDATE USER
 * =========================
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Update fields
        if (email) user.email = email;
        if (role) user.role = role;

        // Password reset (optional)
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        await createUserAudit(
            req,
            `Updated user: ${user.email}${password ? " (password reset)" : ""}`,
            "UPDATE_USER"
        );

        return res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        console.error("UPDATE USER ERROR:", error);
        return res.status(500).json({
            message: "Server error while updating user",
        });
    }
};


/**
 * =========================
 * ADMIN: DELETE USER (HARD DELETE)
 * =========================
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        await createUserAudit(req, `Deleted user: ${user.email}`, "DELETE_USER");

        return res.status(200).json({
            message: "User deleted permanently",
        });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        return res.status(500).json({
            message: "Server error while deleting user",
        });
    }
};

/**
 * =========================
 * ADMIN: BULK DELETE USERS
 * =========================
 */
exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No user ids provided" });
        }
        await User.deleteMany({ _id: { $in: ids } });
        await createUserAudit(req, `Bulk delete (${ids.length} users)`, "BULK_DELETE_USERS");
        res.json({ message: "Selected users deleted" });
    } catch (error) {
        console.error("BULK DELETE USERS ERROR:", error);
        res.status(500).json({ message: "Bulk delete failed" });
    }
};

/**
 * =========================
 * ADMIN: BULK REVOKE USERS (deactivate)
 * =========================
 */
exports.bulkRevoke = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No user ids provided" });
        }
        await User.updateMany({ _id: { $in: ids } }, { $set: { isActive: false } });
        await createUserAudit(req, `Bulk revoke (${ids.length} users)`, "BULK_REVOKE_USERS");
        res.json({ message: "Selected users revoked" });
    } catch (error) {
        console.error("BULK REVOKE USERS ERROR:", error);
        res.status(500).json({ message: "Bulk revoke failed" });
    }
};

/**
 * =========================
 * ADMIN: BULK RESTORE USERS (reactivate)
 * =========================
 */
exports.bulkRestore = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No user ids provided" });
        }
        await User.updateMany({ _id: { $in: ids } }, { $set: { isActive: true } });
        await createUserAudit(req, `Bulk restore (${ids.length} users)`, "BULK_RESTORE_USERS");
        res.json({ message: "Selected users restored" });
    } catch (error) {
        console.error("BULK RESTORE USERS ERROR:", error);
        res.status(500).json({ message: "Bulk restore failed" });
    }
};

/**
 * =========================
 * ADMIN: TOGGLE SINGLE USER (revoke/restore)
 * =========================
 */
exports.revokeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        await createUserAudit(req, `Revoked user: ${user.email}`, "REVOKE_USER");
        res.json({ message: "User revoked", user });
    } catch (error) {
        console.error("REVOKE USER ERROR:", error);
        res.status(500).json({ message: "Revoke failed" });
    }
};

exports.restoreUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        await createUserAudit(req, `Restored user: ${user.email}`, "RESTORE_USER");
        res.json({ message: "User restored", user });
    } catch (error) {
        console.error("RESTORE USER ERROR:", error);
        res.status(500).json({ message: "Restore failed" });
    }
};
