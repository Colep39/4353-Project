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
    {
        id: 2,
        name: "Jason Pedder",
        email: "jason@outlook.com",
        address1: "4024 Oak St",
        address2: "",
        city: "Sugar Land",
        state: "TX",
        zip: "77479",
        skills: ["Event Setup", "Food Distribution", "Fundraising"],
        preferences: "Prefers charity work and food distribution",
        availability: ["Weekdays 9 to 5 pm"],
        joinedEvents: [],
        profilePhoto: "/images/avatars/cole.jpg",
        role: "Volunteer",
    },
    {
        id: 3,
        name: "Ramsey Chandoklow",
        email: "ramsey@outlook.com",
        address1: "3456 Pine St",
        address2: "",
        city: "Galveston",
        state: "TX",
        zip: "77550",
        skills: ["Event Setup", "Food Distribution", "Fundraising"],
        preferences: "Prefers people interaction and event setup",
        availability: ["Weekdays 1 to 7pm"],
        joinedEvents: [],
        profilePhoto: "/images/avatars/cole.jpg",
        role: "Volunteer",
    },
    {
        id: 4,
        name: "Samuel Alvarez",
        email: "sammy@outlook.com",
        address1: "7890 Maple St",
        address2: "",
        city: "League City",
        state: "TX",
        zip: "77573",
        skills: ["Event Setup", "Food Distribution", "Fundraising"],
        preferences: "Prefers indoors with limited people interaction",
        availability: ["Weekends"],
        joinedEvents: [],
        profilePhoto: "/images/avatars/cole.jpg",
        role: "Volunteer",
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