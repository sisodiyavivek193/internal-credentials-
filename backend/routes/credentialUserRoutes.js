const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getRoleCredentials,
    getRoleCredentialPassword,
} = require("../controllers/credentialUserController");

/* =========================
   ROLE USER ROUTES
========================= */

// 🔐 Role based credentials list
router.get(
    "/credentials",
    authMiddleware,
    getRoleCredentials
);

// 🔐 Role based password fetch
router.get(
    "/credentials/:id/password",
    authMiddleware,
    getRoleCredentialPassword
);

module.exports = router;
