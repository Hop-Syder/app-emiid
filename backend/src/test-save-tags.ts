import { supabaseAdmin } from './config/supabase';

async function test() {
  const userId = "b01af775-6f4e-47d1-865a-d4d24970d003"; // ISMAEL CHRISTIAN
  const tags = ["vente", "ui/ux", "developpement"]; // Un nouveau tag

  // Tenter de récupérer le profil
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    console.log("Profile not found");
    return;
  }

  const profileId = profile.id;
  console.log("PROFILE ID:", profileId);

  // Supprimer les liaisons
  const { error: deleteError } = await supabaseAdmin
    .from('profile_tags')
    .delete()
    .eq('profile_id', profileId);

  console.log("DELETE ERROR:", deleteError);

  for (const tagName of tags) {
    const cleanTag = tagName.toLowerCase().trim();
    
    // Récupérer le tag s'il existe
    const { data: existingTag, error: selectError } = await supabaseAdmin
      .from('tags')
      .select('id')
      .eq('name', cleanTag)
      .maybeSingle();

    let finalTagId = existingTag?.id;
    console.log(`Tag "${cleanTag}" existant:`, finalTagId);

    if (!finalTagId) {
      const { data: newTag, error: insertError } = await supabaseAdmin
        .from('tags')
        .insert({ name: cleanTag })
        .select('id')
        .maybeSingle();

      finalTagId = newTag?.id;
      console.log(`Tag "${cleanTag}" créé:`, finalTagId, "Erreur:", insertError);
    }

    if (finalTagId) {
      const { error: ptError } = await supabaseAdmin
        .from('profile_tags')
        .insert({ profile_id: profileId, tag_id: finalTagId });

      console.log(`Liaison tag "${cleanTag}" au profil:`, ptError);
    }
  }

  // Refetch final
  const { data: refetchedProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('*, profile_tags(tags(name))')
    .eq('user_id', userId)
    .single();

  console.log("REFETCHED TAGS:", refetchedProfile?.profile_tags);
}

test();
