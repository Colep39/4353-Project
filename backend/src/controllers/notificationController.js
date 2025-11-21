const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config();

async function getNotifications(req, res) {
    try {
        const header = req.headers.authorization || "";
        const token = header.replace(/^Bearer\s+/i, "");
        if (!token) {
            return res.status(401).json({ error: "Missing token" });
        }

        const { data, error } = await supabaseNoAuth.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

       const userId = data.user.id; 

        const { data: notifications, error: notificationsError } = await supabaseNoAuth
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);

        if (notificationsError) throw notificationsError;

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ error: "No notifications found" });
        }

        res.json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ error: err.message });
    }
}


module.exports = { getNotifications };
