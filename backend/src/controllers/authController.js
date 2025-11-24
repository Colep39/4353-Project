const supabase = require("../supabaseClient");
const supabaseNoAuth = require("../supabaseNoAuth");

const register = async (req, res) => {
    try {
        const { email, password, userType } = req.body || {};

        if (!verifyRegister(email, password, userType)){
            return res.status(400).json({ error: "Invalid registration data"});
        }

        if (process.env.NODE_ENV === "test") {
            return res.status(201).json({
                id: "test-user-id",
                message: "Mock registration success"
        });
}

        const redirectUrl = `https://cougar-connect.vercel.app/callback`;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { 
                emailRedirectTo: redirectUrl,
                data: { role: userType }
            }
        })

        if (error) return res.status(400).json({ error: error.message });
        
        const userId = data.user?.id;
        const role = data.user?.user_metadata?.role;

        // row for user profile init
        const { error: insertError } = await supabaseNoAuth
            .from("user_profile")
            .insert([
                {
                    user_id: userId,
                    availability: [],
                    role: role,
                }
            ]);
        
        if (insertError) {
            console.log(insertError.message)
            return res.status(500).json({ error: "Failed to create user profile" });
        }

        res.json({
            message: "Registration success",
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

        if (process.env.NODE_ENV === "test") {
            return res.status(200).json({
                token: "test-jwt-token",
                refresh_token: "test-refresh-token",
                role: "volunteer",
                userId: "test-user-id"
            });
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

const role = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader){
            return res.status(401).json({ error: "Missing auth header"});
        }

        const token = authHeader.split(" ")[1];

        if (!token){
            return res.status(401).json({ error: "Missing token" });
        }

        const { data, error } = await supabaseNoAuth.auth.getUser(token);

        if (error){
            return res.status(401).json({ error: "Invalid token" });
        }

        const user = data.user;

        const role =
            user?.user_metadata?.role ||
            user?.app_metadata?.role ||
            null;
        
        return res.json({ role });
    } catch (e){
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
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

module.exports = { login, register, refresh, role };