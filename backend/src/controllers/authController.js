const supabase = require("../supabaseClient");
const supabaseNoAuth = require("../supabaseNoAuth");

const register = async (req, res) => {
    try {
        const { email, password, userType } = req.body || {};

        if (!verifyRegister(email, password, userType)){
            return res.status(400).json({ error: "Invalid registration data"});
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { role: userType }}
        })

        if (error) return res.status(400).json({ error: error.message });
        
        const token = data.session?.access_token;
        const refresh_token = data.session?.refresh_token;
        const userId = data.user?.id;
        const role = data.user?.user_metadata?.role;

        // populating the initial user tables with fake data
        const { error: insertError } = await supabaseNoAuth
            .from("user_profile")
            .insert([
                {
                    user_id: userId,
                    full_name: "Update your name",
                    address_1: "Add your address",
                    address_2: null,
                    city: "Add your city",
                    state_id: 1,
                    zipcode: "00000",
                    preferences: "No preferences set",
                    availability: [new Date().toISOString()],
                    role: role,
                }
            ]);
        
        if (insertError) {
            console.log(insertError.message)
            return res.status(500).json({ error: "Failed to create user profile" });
        }

        // q for jason: does this need to exist? not sure how this table works
        const { error: skillsError } = await supabaseNoAuth
            .from("user_skills")
            .insert([
                {
                    user_id: userId,
                    skill_id: 1
                }
            ]);
        
        if (skillsError) {
            console.log(skillsError.message)
            return res.status(500).json({ error: "Failed to create skills profile" });
        }
        res.json({
            message: "Registration success",
            token,
            refresh_token,
            role,
            userId,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }

};

const verifyRegister = (email, password, userType) => {
    if (!email || !password || !userType) {
        return false;
    }
    // add more
    return true;
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        
        if (!verifyLogin(email, password)){
            return res.status(400).json({ error: "Invalid input" });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return res.status(400).json({ error: "Invalid credentials" });

        const token = data.session?.access_token;
        const refresh_token = data.session?.refresh_token;
        const userId = data.user?.id;
        const role = data.user?.user_metadata?.role;

        res.json({ token, refresh_token, role, userId });
    } catch (e){
        res.status(500).json({ error: e.message });
    }
};

const verifyLogin = (email, password) => {
    if (!email || !password){
        return false;
    }

    return true;
}

const refresh = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) return res.status(400).json({ error: "Missing refresh token" });

        const { data, error } = await supabase.auth.refreshSession({ refresh_token });

        if (error) return res.status(400).json({ error: error.message });

        res.json({
            token: data.session.access_token,
            refresh_token: data.session.refresh_token
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports = { login, register, refresh };