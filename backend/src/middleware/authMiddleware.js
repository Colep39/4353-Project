const jwt = require("jsonwebtoken");

function signToken(user){
    const payload = { sub: user.id, role: user.role };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
};

function requireAuth(req, res, next){
    try {
        const header = req.headers.authorization || "";
        const token = header.replace(/^Bearer\s+/i, '');

        if (!token){
            return res.status(401).json({ error: "Missing token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.sub, role: decoded.role };
        next();
    } catch (e) {
        return res.status(401).json({ error: "Unauthenticated" });
    };
};

function requireRole(...roles){
    return (req, res, next) => {
        if (!req.user){
            return res.status(401).json({ error: "Unauthenticated" });
        }

        if (!roles.includes(req.user.role)){
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};

module.exports = { signToken, requireAuth, requireRole };