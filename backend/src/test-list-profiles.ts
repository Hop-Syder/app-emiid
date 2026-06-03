import { supabaseAdmin } from './config/supabase';

async function main() {
  console.log("=== USER PROFILES (user_profiles) ===");
  const { data: userProfiles, error: err1 } = await supabaseAdmin
    .from('user_profiles')
    .select('id, user_id, first_name, last_name, slug, is_published, has_profile');
  
  if (err1) {
    console.error("Error fetching user_profiles:", err1);
  } else {
    console.log(JSON.stringify(userProfiles, null, 2));
  }

  console.log("\n=== PUBLIC PROFILES (public_profiles) ===");
  const { data: publicProfiles, error: err2 } = await supabaseAdmin
    .from('public_profiles')
    .select('id, user_id, first_name, last_name, slug, is_published');
  
  if (err2) {
    console.error("Error fetching public_profiles:", err2);
  } else {
    console.log(JSON.stringify(publicProfiles, null, 2));
  }
}

main();
