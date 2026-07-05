const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminController = require("../controllers/credentialController");


// --- Static & Specific Routes ---
router.get("/download/csv", authMiddleware, adminController.downloadCredentialsCSV);
router.post("/bulk-revoke", authMiddleware, adminController.bulkRevoke);
router.post("/bulk-restore", authMiddleware, adminController.bulkRestore);
router.post("/bulk-delete", authMiddleware, adminController.bulkDelete);

// --- General List Route ---
router.get("/", authMiddleware, adminController.getCredentials);

// --- Dynamic ID Routes ---
// Line 18 ke aas paas yahan check karein
router.get("/:id/list", authMiddleware, adminController.getDecryptedCredentials);
router.get("/:id/password", authMiddleware, adminController.getCredentialPassword);
router.get("/:id/edit", authMiddleware, adminController.getCredentialForEdit);

router.post("/", authMiddleware, adminController.addCredential);
router.put("/:id", authMiddleware, adminController.updateCredential);
router.patch("/:id/revoke", authMiddleware, adminController.revokeCredential);
router.patch("/:id/restore", authMiddleware, adminController.restoreCredential);
router.delete("/:id", authMiddleware, adminController.deleteCredential);

module.exports = router;
