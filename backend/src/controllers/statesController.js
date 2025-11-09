const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config()

async function getStates(req, res){
    try{
        const{ data: states, error } = await supabaseNoAuth
            .from('states')
            .select('*');
        
        if (error) throw error;

        res.json(states);
    } catch(error){
        console.error("Error fetching states from the database: ", error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = { getStates };