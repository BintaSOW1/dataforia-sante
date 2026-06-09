import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jhyjiitogmwmsccplbch.supabase.co';
const supabaseKey = 'sb_publishable_iZ-RMtF7xJt8Do2e4zzbJw_GSQMhwBz';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;