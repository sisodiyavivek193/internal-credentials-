const express = require("express");
const router = express.Router();

const {
    getAuditLogs,
    getAuditSummary,
    createAuditLog,
    deleteAuditLog,
} = require("../controllers/auditLogController");

// ✅ SAHI TARIKA: Kyunki aapne module.exports directly use kiya hai
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Role middleware function return karta hai, toh ADMIN ke liye aise banaiye
const adminOnly = roleMiddleware("ADMIN");

/**
 * CREATE AUDIT LOG
 * Line 19 (Check karein): Ab 'protect' function hai, undefined nahi.
 */
router.post("/log", protect, createAuditLog);

/**
 * AUDIT SUMMARY
 */
// router.get("/actors", protect, getAuditSummary);
router.get("/actors", protect, adminOnly, getAuditSummary);
/**
 * AUDIT LOGS
 */
router.get("/", protect, adminOnly, getAuditLogs);

/**
 * DELETE
 */
router.delete("/:id", protect, adminOnly, deleteAuditLog);

module.exports = router;