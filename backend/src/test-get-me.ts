import { supabaseAdmin } from './config/supabase';

async function test() {
  // Test avec l'UUID de l'utilisateur ISMAEL CHRISTIAN par exemple:
  const userId = "b01af775-6f4e-47d1-865a-d4d24970d003"; 
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*, countries(name, iso_code), profile_tags(tags(name))')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.log("ERROR:", error);
    return;
  }

  if (data) {
    data.tags = data.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];
    delete data.profile_tags;
  }

  console.log("FINAL RESPONDED DATA tags:", data.tags);
}

test();
