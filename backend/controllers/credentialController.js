const Credential = require("../models/Credential");
const cryptoUtil = require("../utils/crypto");
const AuditLog = require("../models/AuditLog");
const APIFeatures = require("../utils/APIFeatures");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendPushToUsers } = require("../utils/webpush");

/**
 * Helper: jab kisi role ke liye naya credential add ho, us role ke
 * saare active users ko ek notification bhej do.
 */
async function notifyRoleUsers(roles, credential, type) {
    try {
        const roleList = Array.isArray(roles) ? roles : [roles];
        if (!roleList.length) return;

        const targetUsers = await User.find({
            role: { $in: roleList },
            isActive: true,
        }).select("_id");

        if (!targetUsers.length) return;

        const title = type === "CREDENTIAL_UPDATED" ? "Credential updated" : "New credential added";
        const message =
            type === "CREDENTIAL_UPDATED"
                ? `Credentials for "${credential.projectName}" were updated.`
                : `New credentials were added for "${credential.projectName}". Check your credentials list.`;

        const notifDocs = targetUsers.map((u) => ({
            recipientId: u._id,
            title,
            message,
            type,
            credentialId: credential._id,
        }));

        const created = await Notification.insertMany(notifDocs);

        // 🔔 In-app notification ke saath-saath real browser push bhi bhejo
        // (agar user ne push allow kiya hua hai). Ye tab bhi kaam karta hai
        // jab browser tab band ho, service worker background mein handle karta hai.
        await Promise.all(
            created.map((n) =>
                sendPushToUsers([n.recipientId], {
                    title,
                    message,
                    notificationId: n._id.toString(),
                    credentialId: credential._id.toString(),
                })
            )
        );
    } catch (err) {
        // Notification fail hone se credential create/update fail nahi hona chahiye
        console.error("NOTIFY ROLE USERS ERROR:", err.message);
    }
}

/**
 * Helper: Centralized Audit Logging
 */
async function createAudit(req, projName, action, ids) {
    try {
        await AuditLog.create({
            actorId: req.user.id,
            actorRole: req.user.role,
            projectName: projName || "System Action",
            action: action,
            credentialIds: Array.isArray(ids) ? ids : [ids],
            ip: req.headers['x-forwarded-for'] || req.ip,
            userAgent: req.headers["user-agent"],
        });
    } catch (err) {
        console.error("Audit Log Error:", err.message);
    }
}

/* ============================================================
   READ OPERATIONS (GET)
   ============================================================ */

exports.getCredentials3 = async (req, res) => {
    try {


        const features = new APIFeatures(Credential.find(), req.query).paginate()


        const { search = "", page = 1, limit = 10 } = req.query;
        console.log("🚀 ~ req.query:", req.query)


        let filter = {};

        if (req.user.role !== "admin") {
            filter.isActive = true;
            filter.$or = [
                { roles: { $in: [req.user.role] } }
            ];
        }

        if (search) {
            filter.projectName = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            // Passwords ko exclude kar rahe hain list view mein security ke liye
            Credential.find(filter, "-credentials.password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Credential.countDocuments(filter),
        ]);


        res.json({
            data,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching credentials" });
    }
};

exports.getCredentials = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const features = new APIFeatures(
            Credential.find().sort({ createdAt: -1 }), // 👈 NEWEST FIRST
            req.query
        )
            .search()
            .paginate();

        const credentials = await features.query;

        const totalDocuments = await Credential.countDocuments();

        res.status(200).json({
            status: 'success',
            data: credentials,
            pagination: {
                page,
                limit,
                total: totalDocuments,
                totalPages: Math.ceil(totalDocuments / limit)
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};




// Edit Form ke liye poora data decrypt karke bhejenge
exports.getCredentialForEdit = async (req, res) => {
    try {
        const project = await Credential.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Not found" });

        const data = project.toObject();
        // Array ke har password ko decrypt karo
        data.credentials = data.credentials.map(c => ({
            ...c,
            password: cryptoUtil.decrypt(c.password)
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching for edit" });
    }
};

/* ============================================================
   WRITE OPERATIONS (POST/PUT)
   ============================================================ */

exports.addCredential = async (req, res) => {
    try {
        const { projectName, projectUrl, roles, projectNotes, credentials } = req.body;

        // Validation check (label hata diya)
        if (!projectName || !roles || !credentials || !Array.isArray(credentials)) {
            return res.status(400).json({ message: "Required fields missing or invalid format" });
        }

        // Encryption logic (label ki zaroorat nahi hai)
        const encryptedCredentials = credentials.map(c => ({
            username: c.username,
            password: cryptoUtil.encrypt(c.password)
        }));

        const newProject = await Credential.create({
            projectName,
            projectUrl,
            credentials: encryptedCredentials,
            roles: Array.isArray(roles) ? roles : [roles],
            projectNotes: projectNotes || "",
            isActive: true
        });

        await createAudit(req, projectName, "ADD_PROJECT", newProject._id);

        // Us role ke saare active users ko naya credential add hone ki notification bhejo
        await notifyRoleUsers(newProject.roles, newProject, "CREDENTIAL_ADDED");

        res.status(201).json({ message: "Project added successfully", id: newProject._id });
    } catch (error) {
        console.error("BACKEND ERROR:", error); // Ye check karne ke liye ki error kya hai
        res.status(500).json({ message: "Error adding project", error: error.message });
    }
};

exports.updateCredential = async (req, res) => {
    try {
        const { projectName, projectUrl, roles, projectNotes, credentials } = req.body;

        const updateData = {
            projectName,
            projectUrl,
            projectNotes,
            roles: Array.isArray(roles) ? roles : [roles]
        };

        // Agar naye credentials aaye hain toh unhe encrypt karke update karein
        if (credentials && Array.isArray(credentials)) {
            updateData.credentials = credentials.map(c => ({
                label: c.label,
                username: c.username,
                password: cryptoUtil.encrypt(c.password)
            }));
        }

        const updated = await Credential.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: "Not found" });

        await createAudit(req, updated.projectName, "UPDATE_PROJECT", updated._id);

        // Us role ke users ko update ki notification bhejo
        await notifyRoleUsers(updated.roles, updated, "CREDENTIAL_UPDATED");

        res.json({ message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

/* ============================================================
   STATUS & DELETE
   ============================================================ */

exports.revokeCredential = async (req, res) => {
    const cred = await Credential.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );
    if (cred) await createAudit(req, cred.projectName, "REVOKE", cred._id);
    res.json({ message: "Revoked" });
};

exports.restoreCredential = async (req, res) => {
    const cred = await Credential.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
    );
    if (cred) await createAudit(req, cred.projectName, "RESTORE", cred._id);
    res.json({ message: "Restored" });
};

exports.deleteCredential = async (req, res) => {
    const cred = await Credential.findByIdAndDelete(req.params.id);
    if (cred) await createAudit(req, cred.projectName, "DELETE", cred._id);
    res.json({ message: "Deleted permanently" });
};

/**
 * =========================
 * GET PASSWORD (FOR MODAL)
 * =========================
 * Is API se specific credential ka password decrypt hoke milega jab 'View All' Modal khulega
 */
exports.getDecryptedCredentials = async (req, res) => {
    try {
        const project = await Credential.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Not found" });

        // Security Check
        if (!["admin", "uiux", "developer"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const decryptedList = project.credentials.map(c => ({
            label: c.label,
            username: c.username,
            password: cryptoUtil.decrypt(c.password),
            _id: c._id
        }));

        // Audit log: Poore project ke credentials dekhe gaye
        await createAudit(req, project.projectName, "VIEW_ALL_PASSWORDS", project._id);

        res.json(decryptedList);


    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/* ============================================================
   CSV EXPORT (Updated for Multi-Cred)
   ============================================================ */
exports.downloadCredentialsCSV = async (req, res) => {
    try {
        const projects = await Credential.find({}).sort({ createdAt: -1 });
        let csv = "\ufeffProject Name,Roles,Label,Username,Password,Notes\n";

        projects.forEach(p => {
            const roles = Array.isArray(p.roles) ? p.roles.join(" | ") : "";

            // Har project ke andar ke saare credentials ko naye row mein daalo
            p.credentials.forEach(c => {
                const pass = cryptoUtil.decrypt(c.password);
                const cleanName = (p.projectName || "").replace(/"/g, '""');
                const cleanLabel = (c.label || "").replace(/"/g, '""');
                const cleanUser = (c.username || "").replace(/"/g, '""');
                const cleanPass = (pass || "").replace(/"/g, '""');
                const cleanNotes = (p.projectNotes || "").replace(/<[^>]*>/g, '').replace(/"/g, '""').replace(/\n/g, ' ');

                csv += `"${cleanName}","${roles}","${cleanLabel}","${cleanUser}","${cleanPass}","${cleanNotes}"\n`;
            });
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=All_Credentials.csv");
        return res.status(200).send(csv);
    } catch (e) {
        return res.status(500).json({ message: "CSV Export failed" });
    }
};


// Ye function bulkRevoke missing tha, isse add karo
exports.bulkRevoke = async (req, res) => {
    try {
        const { ids } = req.body;
        await Credential.updateMany({ _id: { $in: ids } }, { $set: { isActive: false } });
        await createAudit(req, `Bulk Revoke (${ids.length} items)`, "BULK_REVOKE", ids);
        res.json({ message: "Selected credentials revoked" });
    } catch (error) {
        res.status(500).json({ message: "Bulk revoke failed" });
    }
};

// Baaki Bulk Functions (Aapne diye hain, bas confirm karlo exports. laga hai)
exports.bulkRestore = async (req, res) => {
    try {
        const { ids } = req.body;
        await Credential.updateMany({ _id: { $in: ids } }, { $set: { isActive: true } });
        await createAudit(req, `Bulk Restore (${ids.length} items)`, "BULK_RESTORE", ids);
        res.json({ message: "Selected credentials restored" });
    } catch (error) {
        res.status(500).json({ message: "Bulk restore failed" });
    }
};
exports.getCredentialPassword = async (req, res) => {
    try {
        const project = await Credential.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Not found" });

        // Agar purane schema wala single password hai
        const password = project.projectPassword
            ? cryptoUtil.decrypt(project.projectPassword)
            : cryptoUtil.decrypt(project.credentials[0]?.password);

        res.json({ password });
    } catch (error) {
        res.status(500).json({ message: "Error decrypting password" });
    }
};


exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        await Credential.deleteMany({ _id: { $in: ids } });
        await createAudit(req, `Bulk Delete (${ids.length} items)`, "BULK_DELETE", ids);
        res.json({ message: "Selected credentials deleted" });
    } catch (error) {
        res.status(500).json({ message: "Bulk delete failed" });
    }
};
