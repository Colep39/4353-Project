const supabase = require('../supabaseClient');
require('dotenv').config();

let sampleNotifications = [
    "Event 'Operating Systems Exam 1' starts tomorrow!",
    "A new event has been created that might interest you!",
    "You have a new volunteer request.",
    "Thank you for attending Santiago's Birthday Bash!",
];

const getNotifications = async (req, res) => {
    try{
        const userId = req.params.id;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) throw error;

        if (data && data.length > 0) {
            const notifications = data.map(notification => notification.message);
            res.json(notifications);
        }
    }
    catch(err){
        console.error("Error fetching notifications:", err);
        res.status(500).json({ error: err.message });
    }
}

const createNotification = (req, res) => {
    res.json({ message: "Create notification placeholder" });
}

module.exports = { getNotifications, createNotification };
