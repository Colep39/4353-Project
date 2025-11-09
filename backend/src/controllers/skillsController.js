const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config()

async function getSkills(req, res){
    try{
        const{ data: skills, error } = await supabaseNoAuth
            .from('skills')
            .select('*');
        
        if (error) throw error;

        res.json(skills);
    } catch(error){
        console.error("Error fetching skills from the database: ", error)
    }
}

module.exports = { getSkills };