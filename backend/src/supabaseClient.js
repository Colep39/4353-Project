const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const supabaseUrl = 'https://gtojdhgpqorgfuvyttfs.supabase.co'

const supabase = createClient(
    supabaseUrl,
    process.env.SUPABASE_KEY
);

module.exports = supabase;