const { findUser } = require("../models/User");
const { signToken } = require("../middleware/authMiddleware");

const login = (req, res) => {
    const { email, password } = req.body || {};
    const user = findUser(email);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ token, role: user.role, userId: user.id });
};

const register = (req, res) => {
    const { email, password, userType } = req.body || {};

    if (!email || !password || !userType) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = {
        id: 3,
        email,
        role: userType,
    };

    const token = signToken(user);
    return res.json({
        message: "Registration success",
        token,
        role: user.role,
        userId: user.id,
    });
};

module.exports = { login, register };