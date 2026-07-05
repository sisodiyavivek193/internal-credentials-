const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 1. AuthController se 'register' ko import karein
const { register } = require("../controllers/authController");

const {
    getAllUsers,
    getUserById,
    getUserQRCode,
    createUser,
    updateUser,
    deleteUser,
    bulkDelete,
    bulkRevoke,
    bulkRestore,
    revokeUser,
    restoreUser,
} = require("../controllers/adminUserController");


// GET all users
router.get("/", authMiddleware, roleMiddleware("admin"), getAllUsers);

// GET single user's 2FA QR code (must be before "/:id" so it isn't swallowed as an id)
router.get("/:id/qrcode", authMiddleware, roleMiddleware("admin"), getUserQRCode);

// GET single user
router.get("/:id", authMiddleware, roleMiddleware("admin"), getUserById);

// 2. 🔥 YAHAN BADLAV KAREIN: 'createUser' ko hata kar 'register' laga dein
// Kyunki 'register' ke andar hi humne 2FA QR code ka logic likha hai
router.post("/", authMiddleware, roleMiddleware("admin"), register);

// BULK ACTIONS (must be before /:id routes conflicts are fine since these are distinct sub-paths)
router.post("/bulk-delete", authMiddleware, roleMiddleware("admin"), bulkDelete);
router.post("/bulk-revoke", authMiddleware, roleMiddleware("admin"), bulkRevoke);
router.post("/bulk-restore", authMiddleware, roleMiddleware("admin"), bulkRestore);

// SINGLE REVOKE / RESTORE
router.patch("/:id/revoke", authMiddleware, roleMiddleware("admin"), revokeUser);
router.patch("/:id/restore", authMiddleware, roleMiddleware("admin"), restoreUser);

// UPDATE user
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateUser);

// DELETE user
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

module.exports = router;
