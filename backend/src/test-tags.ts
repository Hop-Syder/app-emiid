import { supabaseAdmin } from './config/supabase';

async function test() {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, user_id, first_name, last_name, profile_tags(tags(name))')
    .limit(5);

  console.log('QUERY DATA:', JSON.stringify(data, null, 2));
  console.log('QUERY ERROR:', error);
}

test();
