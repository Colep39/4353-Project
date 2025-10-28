let sampleProfiles = [
    {
        id: 1,
        name: "Cole Hawke",
        email: "colep3@icloud.com",
        address1: "1234 Elm St",
        address2: "",
        city: "Antarctica City",
        state: "",
        zip: "99999",
        skills: ["Event Setup", "Food Distribution", "Fundraising"],
        preferences: "Prefers outdoor volunteering opportunities.",
        availability: ["Weekdays after 5pm", "Weekends"],
        joinedEvents: [],
        profilePhoto: "/images/avatars/cole.jpg",
        role: "Admin",
    },
];

async function getUserProfile(req, res) {
    try{
        const { id } = req.params;
        const user = sampleProfiles.find(user => user.id === parseInt(id));
        if (!user){
            return res.status(404).json({ message: "User not found"});
        } 
        res.json(user);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error retrieving profile' });
    }
}

async function updateProfile(req, res) {
    const { id, name, address1, address2, city, state, zip, skills, preferences, availability, joinedEvents, profilePhoto } = req.body;
    try{
        const userIndex = sampleProfiles.findIndex(user => user.id === parseInt(id));
        if (userIndex === -1){
            return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = { ...sampleProfiles[userIndex], name, address1, address2, city, state, zip, skills, preferences, availability, joinedEvents, profilePhoto };
        sampleProfiles[userIndex] = updatedUser;
        res.json(updatedUser);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}

module.exports = { getUserProfile, updateProfile };