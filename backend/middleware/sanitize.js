/**
 * Lightweight NoSQL-injection sanitizer, written by hand instead of using
 * the "express-mongo-sanitize" npm package.
 *
 * WHY NOT THE NPM PACKAGE: express-mongo-sanitize tries to REASSIGN
 * req.query (`req.query = cleanObj`), but in Express 5, req.query is a
 * getter-only property with no setter — that throws
 * "TypeError: Cannot set property query of #<IncomingMessage> which has
 * only a getter" on EVERY request. Tested and confirmed while building
 * this feature, so we sanitize objects IN PLACE instead (delete bad keys
 * from the existing object) which works fine on both Express 4 and 5.
 *
 * Strips any object key that:
 *   - starts with "$"   (blocks operator injection like { "$gt": "" })
 *   - contains "."      (blocks dot-path injection)
 */

function sanitizeInPlace(obj) {
    if (!obj || typeof obj !== "object") return;

    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
            continue;
        }

        const val = obj[key];
        if (val && typeof val === "object") {
            sanitizeInPlace(val);
        }
    }
}

module.exports = function mongoSanitize(req, res, next) {
    if (req.body) sanitizeInPlace(req.body);
    if (req.params) sanitizeInPlace(req.params);
    if (req.query) sanitizeInPlace(req.query); // mutated in place, never reassigned
    next();
};
