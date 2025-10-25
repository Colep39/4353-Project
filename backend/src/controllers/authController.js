const { findUser } = require("../models/User");
const supabase = require("../supabaseClient")

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
        const userId = data.user?.id;
        const role = data.user?.user_metadata?.role;

        res.json({
            message: "Registration success",
            token,
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
        const userId = data.user?.id;
        const role = data.user?.user_metadata?.role;

        res.json({ token, role, userId });
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

module.exports = { login, register };