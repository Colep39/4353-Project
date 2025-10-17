let sampleNotifications = [
    "Event 'Operating Systems Exam 1' starts tomorrow!",
    "A new event has been created that might interest you!",
    "You have a new volunteer request.",
    "Thank you for attending Santiago's Birthday Bash!",
];

const getNotifications = (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId) || parsedId <= 0) {
        return res.status(401).json({ message: "Invalid ID parameter" });
    }

    res.json(sampleNotifications);
}

const createNotification = (req, res) => {
    res.json({ message: "Create notification placeholder" });
}

module.exports = { getNotifications, createNotification };
