const USERS = [
    { id: "u1", email: "vol@test.com", password: "vol", role: "volunteer" },
    { id: "u2", email: "admin@test.com", password: "admin", role: "admin" },
]

function findUser(email){
    return USERS.find(u => u.email === email);
}

module.exports = { findUser };