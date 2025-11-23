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
                profile_photo,
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
        const body = req.body;

        const { data: stateRow } = await supabaseNoAuth
            .from('states')
            .select('state_id')
            .or(`state_code.eq.${body.state}, state_name.eq.${body.state}`)
            .single();

        const state_id = stateRow?.state_id ?? null;

        // updating the main profile fields
        const { error: updateError } = await supabaseNoAuth
            .from('user_profile')
            .update({
                full_name: body.full_name,
                address_1: body.address_1,
                address_2: body.address_2,
                city: body.city,
                zipcode: body.zipcode,
                preferences: body.preferences,
                availability: body.availability,
                state_id: state_id,
                profile_photo: body.profile_photo
            })
             .eq("user_id", userId);

        if (updateError) throw updateError;

        // update the user skills table
        await supabaseNoAuth
            .from('user_skills')
            .delete()
            .eq('user_id', userId)

        const skills = Array.isArray(body.skills)
      ? body.skills
      : body.skills.split(",").map(s => s.trim()).filter(Boolean);

        if (skills.length > 0) {
        // Fetch skill IDs
        const { data: skillRows } = await supabaseNoAuth
            .from("skills")
            .select("skill_id, description")
            .in("description", skills);

        // Insert join rows
        if (skillRows && skillRows.length > 0) {
            await supabaseNoAuth
            .from("user_skills")
            .insert(
                skillRows.map((row) => ({
                user_id: userId,
                skill_id: row.skill_id
                }))
            );
        }
        }

        return res.status(200).json({ message: "Profile updated successfully" });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}

async function updateAdminProfile(req, res){
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
        const body = req.body;

        // updating the main profile fields
        const { error: updateError } = await supabaseNoAuth
            .from('user_profile')
            .update({
                full_name: body.full_name,
            })
             .eq("user_id", userId);

        if (updateError) throw updateError;
        
        return res.status(200).json({ message: "Profile updated successfully" });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}

async function isProfileComplete(userId){
    const { data: profile, error} = await supabaseNoAuth
        .from("user_profile")
        .select(`
            full_name, address_1, city, zipcode, state_id,
            skills:user_skills(skill_id),
            availability
        `)
        .eq("user_id", userId)
        .single();
    
    if (error || !profile) {
        return false;
    }

    const hasRequiredFields = !!(
        profile.full_name &&
        profile.address_1 &&
        profile.city &&
        profile.zipcode &&
        profile.state_id
    );


    const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
    const hasAvailability = Array.isArray(profile.availability) && profile.availability.length > 0;

    return hasRequiredFields && hasSkills && hasAvailability;
}

module.exports = { getUserProfile, updateProfile, updateAdminProfile, isProfileComplete };