const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config()

async function getSkills(req, res) {
  try {
    const { data: skills, error } = await supabaseNoAuth
      .from("skills")
      .select("*");

    if (error) throw error;

    return res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching skills: ", error);
    return res.status(500).json({ message: "Failed to load skills" });
  }
}


module.exports = { getSkills };