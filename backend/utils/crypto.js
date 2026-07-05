const crypto = require("crypto");

const ALGO = "aes-256-cbc";
const IV_LEN = 16;

// 🔥 ALWAYS derive 32-byte key
const SECRET_KEY = crypto
    .createHash("sha256")
    .update(process.env.CREDENTIAL_SECRET)
    .digest(); // 32 bytes

exports.encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
};

exports.decrypt = (text) => {
    try {
        if (!text || !text.includes(":")) return null;

        const [ivHex, encryptedHex] = text.split(":");

        const iv = Buffer.from(ivHex, "hex");
        const encryptedText = Buffer.from(encryptedHex, "hex");

        const decipher = crypto.createDecipheriv(ALGO, SECRET_KEY, iv);

        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        console.error("DECRYPT FAILED:", err.message);
        return null;
    }
};
