const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config();

async function getUserProfile(req, res) {
    try{
        const header = req.headers.authorization || "";
        const token = header.replace(/^Bearer\s+/i, "")
        if (!token) {
            return res.status(401).json({ error: "Missing token"});
        }
        const { data, error } = await supabaseNoAuth.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        const userId = data.user.id;

        const { data: userProfile, error: profileError } = await supabaseNoAuth
            .from("user_profile")
            .select(`
                full_name,
                address_1,
                address_2,
                city,
                zipcode,
                preferences,
                availability,
                role,
                state:states (
                    state_id,
                    state_code,
                    state_name
                ),
                skills:user_skills (
                    skill_id,
                    skills (
                        description
                    )
                )
            `)
            .eq("user_id", userId)
            .single();
        
        if (profileError) throw profileError;

        // throw error if there was no user profile
        if (!userProfile || userProfile.length === 0){
            return res.status(404).json({ message: 'User Profile was not found'});
        }

        res.json(userProfile);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error retrieving profile' });
    }
}

async function updateProfile(req, res) {
    try{
        const header = req.headers.authorization || "";
        const token = header.replace(/^Bearer\s+/i, "")
        if (!token) {
            return res.status(401).json({ error: "Missing token"});
        }
        const { data, error } = await supabaseNoAuth.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        const userId = data.user.id;
        
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}

module.exports = { getUserProfile, updateProfile };