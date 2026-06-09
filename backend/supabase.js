const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Client public (avec RLS)
const supabase = createClient(supabaseUrl, supabaseKey);

// Client service (bypass RLS pour le backend)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;