const Credential = require("../models/Credential");
const cryptoUtil = require("../utils/crypto");
const AuditLog = require("../models/AuditLog");


/* =========================
   GET ROLE-WISE CREDENTIALS (Popup ke liye)
========================= */

exports.getRoleCredentials = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 20 } = req.query;
        const userRole = req.user.role;

        // Define query to find active projects matching user role in single string or array
        const query = {
            isActive: true,
            $or: [
                { role: { $regex: userRole, $options: "i" } },
                { roles: { $in: [new RegExp(userRole, "i")] } },
                { roles: userRole }
            ]
        };

        // Apply project name search filter if provided
        if (search) {
            query.projectName = { $regex: search, $options: "i" };
        }

        const total = await Credential.countDocuments(query);
        const data = await Credential.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Filter and decrypt credentials within each project based on user role
        const filteredData = data.map(project => {
            const projectObj = project.toObject();

            if (projectObj.credentials && Array.isArray(projectObj.credentials)) {
                projectObj.credentials = projectObj.credentials.filter(c => {
                    // Show credential if label is missing (safety fallback)
                    if (!c.label) return true;

                    const labelName = c.label.toLowerCase();
                    const roleToMatch = userRole.toLowerCase();

                    // Check for partial matches between role and credential label
                    return labelName.includes(roleToMatch) || roleToMatch.includes(labelName);
                }).map(c => {
                    try {
                        // Decrypt the password for the authorized user
                        return {
                            ...c,
                            password: cryptoUtil.decrypt(c.password)
                        };
                    } catch (e) {
                        return { ...c, password: "Decryption Error" };
                    }
                });
            }
            return projectObj;
        });

        // Return paginated response
        res.json({
            data: filteredData,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            },
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

/* =========================
   COPY PASSWORD (ROLE USERS)
========================= */
exports.getRoleCredentialPassword = async (req, res) => {
    try {
        console.log("\n*********************************************");
        console.log("🚀 COPY PASSWORD API HIT!");
        console.log("🆔 TARGET ID:", req.params.id);

        // ✅ FIXED: FindOne mein bhi multi-role check add kiya
        const credential = await Credential.findOne({
            _id: req.params.id,
            isActive: true,
            $or: [
                { role: req.user.role },
                { roles: { $in: [req.user.role] } }
            ]
        });

        if (!credential) {
            console.log("❌ NOT FOUND: ID match nahi hui ya access nahi hai");
            return res.status(403).json({ message: "Access denied" });
        }

        const password = cryptoUtil.decrypt(credential.projectPassword);

        console.log("📂 PROJECT NAME  :", credential.projectName);
        console.log("✅ LOGGING ACTION...");

        // Audit Log entry
        await AuditLog.create({
            actorId: req.user.id,
            actorRole: req.user.role,
            projectName: credential.projectName || "Unknown",
            action: "PASSWORD_COPY",
            credentialIds: [credential._id],
            ip: req.headers['x-forwarded-for'] || req.ip,
            userAgent: req.headers["user-agent"],
        });

        console.log("✅ LOG CREATED");
        console.log("*********************************************\n");

        res.json({ password });
    } catch (err) {
        console.error("❌ BACKEND ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};