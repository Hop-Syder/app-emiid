const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/home/hopsyder/Projet/app-nukun/frontend-user/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const id = 'b01af775-6f4e-47d1-865a-d4d24970d003';
    console.log("Querying with UUID...");
    const res1 = await supabase
        .from('user_profiles')
        .select(`first_name, slug`)
        .or(`slug.eq.${id},user_id.eq.${id}`)
        .single();
    console.log("Result 1:", res1);

    const slug = 'hopsyder';
    console.log("Querying with Slug...");
    const res2 = await supabase
        .from('user_profiles')
        .select(`first_name, slug`)
        .or(`slug.eq.${slug},user_id.eq.${slug}`)
        .single();
    console.log("Result 2:", res2);
}
test();
