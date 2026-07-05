const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");

/**
 * 1. CREATE AUDIT LOG
 * Track actions like PASSWORD_COPY, ADD, UPDATE etc.
 */
exports.createAuditLog = async (req, res) => {
    try {
        const { action, projectName, credentialIds } = req.body;

        if (!action) {
            return res.status(400).json({ message: "Action is required" });
        }

        await AuditLog.create({
            actorId: req.user.id,          // From auth middleware
            actorRole: req.user.role,      // ADMIN / USER
            projectName: projectName || "N/A",
            action,
            credentialIds: credentialIds || [],
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        res.json({ success: true });
    } catch (error) {
        console.error("AUDIT LOG CREATE ERROR:", error);
        res.status(500).json({ message: "Failed to create audit log" });
    }
};

/**
 * 2. GET AUDIT SUMMARY (NEW)
 */
exports.getAuditSummary = async (req, res) => {
    try {
        const summary = await AuditLog.aggregate([
            {
                $group: {
                    _id: "$actorId",
                    role: { $first: "$actorRole" },
                    totalActions: { $sum: 1 },
                    lastActive: { $max: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: "users", // Check your exact collection name in MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "details"
                }
            },
            { $unwind: "$details" },
            {
                $project: {
                    _id: 1,
                    role: 1,
                    totalActions: 1,
                    lastActive: 1,
                    name: "$details.name",
                    email: "$details.email"
                }
            },
            { $sort: { lastActive: -1 } }
        ]);
        res.json(summary);
    } catch (error) {
        console.error("SUMMARY ERROR:", error);
        res.status(500).json({ message: "Failed to fetch summary" });
    }
};

/**
 * 3. GET AUDIT LOGS (DETAILED)
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { userId, page = 1, limit = 20 } = req.query;
        let query = {};

        if (userId) {
            query.actorId = new mongoose.Types.ObjectId(userId);
        }

        const skip = (page - 1) * limit;

        // console.log(`\n--- 📡 FETCHING LOGS: User ${userId || 'All'} ---`);

        const logs = await AuditLog.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $addFields: {
                    // Check if projectName is a valid MongoDB ObjectId string
                    tempProjectId: {
                        $cond: {
                            if: { $regexMatch: { input: { $ifNull: ["$projectName", ""] }, regex: /^[0-9a-fA-F]{24}$/ } },
                            then: { $toObjectId: "$projectName" },
                            else: null
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "credentials",
                    localField: "tempProjectId",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            {
                $project: {
                    _id: 1,
                    action: 1,
                    createdAt: 1,
                    actorRole: 1,
                    originalValue: "$projectName",
                    // Agar lookup se naam mila toh wo dikhao, nahi toh original string (System/Bulk/ProjectName)
                    projectName: {
                        $cond: {
                            if: { $gt: [{ $size: "$projectInfo" }, 0] },
                            then: { $arrayElemAt: ["$projectInfo.projectName", 0] },
                            else: "$projectName"
                        }
                    }
                }
            }
        ]);



        const total = await AuditLog.countDocuments(query);
        res.json({
            data: logs,
            pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("❌ LOGS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * 4. DELETE LOG
 */
exports.deleteAuditLog = async (req, res) => {
    try {
        await AuditLog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Log deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete error" });
    }
};