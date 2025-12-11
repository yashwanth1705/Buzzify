
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    // Load .env.local
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.local file not found');
        process.exit(1);
    }

    const envConfig = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
            envVars[key] = value;
        }
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    console.log('Connecting to Supabase at:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const email = '202317B2255@wilp.bits-pilani.ac.in';
    console.log('Checking for user:', email);

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email); // Use ilike for case-insensitive check

    if (error) {
        console.error('Error querying Supabase:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('User FOUND in database:');
        console.log(data);
    } else {
        console.log('User NOT FOUND in database.');
    }
}

main();
