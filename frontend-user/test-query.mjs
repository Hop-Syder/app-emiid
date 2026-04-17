import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const validUuid = 'b01af775-6f4e-47d1-865a-d4d24970d003';
    console.log("Testing with valid UUID:", validUuid);
    const res1 = await supabase
        .from('user_profiles')
        .select(`id, user_id, first_name, slug`)
        .or(`slug.eq.${validUuid},user_id.eq.${validUuid}`)
        .single();
    console.log("Res1:", res1);

    const invalidUuid = 'not-a-uuid-at-all';
    console.log("\nTesting with invalid UUID (pure slug):", invalidUuid);
    const res2 = await supabase
        .from('user_profiles')
        .select(`id, user_id, first_name, slug`)
        .or(`slug.eq.${invalidUuid},user_id.eq.${invalidUuid}`)
        .single();
    console.log("Res2:", res2);
}

run();
