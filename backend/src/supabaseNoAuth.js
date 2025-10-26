// this is ONLY TO BE USED for NON-AUTH OPERATIONS
// for example, the backend retrieving a bunch of data from the DB
// the endpoint is already authorized thru middleware.

const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const supabaseUrl = 'https://gtojdhgpqorgfuvyttfs.supabase.co'

const supabaseNoAuth = createClient(
      supabaseUrl,
      process.env.SUPABASE_KEY,
      { auth: { persistSession: false } }
);

module.exports = supabaseNoAuth;