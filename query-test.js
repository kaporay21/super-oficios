const fs = require('fs');
const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
const urlMatch = content.match(/const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL \|\| '([^']+)'/);
const keyMatch = content.match(/const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY \|\| '([^']+)'/);
if(urlMatch && keyMatch) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('perfiles').select('oficios').limit(1).then(res => console.log("DB perfiles oficios:", JSON.stringify(res.data)));
}
