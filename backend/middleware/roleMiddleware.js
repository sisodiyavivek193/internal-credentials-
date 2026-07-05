// module.exports = (requiredRole) => {
//     return (req, res, next) => {
//         // 🔐 Safety checks
//         if (!req.user || !req.user.role) {
//             return res.status(401).json({
//                 message: "Unauthorized",
//             });
//         }

//         if (req.user.role !== requiredRole) {
//             return res.status(403).json({
//                 message: "Access denied",
//             });
//         }

//         next();
//     };
// };


module.exports = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // ✅ Dono ko Uppercase karke check karo (Case-insensitive)
        if (req.user.role.toUpperCase() !== requiredRole.toUpperCase()) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    };
};
