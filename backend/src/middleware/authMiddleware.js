const supabase = require("../supabaseClient")

async function requireAuth(req, res, next){
    try {
        if (process.env.NODE_ENV === "test"){
            req.user = {
                id: "test-user-id",
                role: "volunteer",
                email: "test@example.com"
            };
            return next();
        }
        const header = req.headers.authorization || "";
        const token = header.replace(/^Bearer\s+/i, '');

        if (!token){
            return res.status(401).json({ error: "Missing token" });
        }
        
        const { data: {user}, error } = await supabase.auth.getUser(token);

        if (error || !user) return res.status(401).json({ error: "Invalid token" });

        req.user = {
            id: user.id,
            role: user.user_metadata?.role,
            email: user.email
        };

        next();
    } catch {
        return res.status(401).json({ error: "Unauthenticated" });
    };
};

function requireRole(...roles){
    return (req, res, next) => {
        if (process.env.NODE_ENV === "test") return next();

        if (!req.user){
            return res.status(401).json({ error: "Unauthenticated" });
        }

        if (!roles.includes(req.user.role)){
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};

module.exports = { requireAuth, requireRole };