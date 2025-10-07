let sampleNotifications = [
    "Event 'Operating Systems Exam 1' starts tomorrow!",
    "A new event has been created that might interest you!",
    "You have a new volunteer request.",
    "Thank you for attending Santiago's Birthday Bash!",
];

const getNotifications = (req, res) => {
    res.json(sampleNotifications);
}

const createNotification = (req, res) => {
    res.json({ message: "Create notification placeholder" });
}

module.exports = { getNotifications, createNotification };
