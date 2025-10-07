const sampleProfiles = [
    
];

const getUserProfile = (req, res) => {
    res.json(sampleProfiles);
}

const updateProfile = (req, res) => {
    res.json({ message: "Update profile placeholder" });
}

module.exports = { getUserProfile };