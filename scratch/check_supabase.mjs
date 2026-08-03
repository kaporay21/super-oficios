import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://bdpytburftoxgzlqdaen.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcHl0YnVyZnRveGd6bHFkYWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTg3OTUsImV4cCI6MjA5NTIzNDc5NX0.YXJqtxY4_3WQttlL6eW1KQlRXPaJHy7yJa8BGnBZnSs';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function testRoles() {
  const adminId = 'd81c819b-8ef8-47b3-a75b-3ac64aa65375';
  const email = 'gonzalohumacata1992@gmail.com';
  
  const roles = ['cliente', 'profesional', 'Admin', 'ADMIN', 'administrador'];
  for (const rol of roles) {
    const { data, error } = await supabase.from('perfiles').upsert({
      id: adminId,
      email: email,
      nombre: 'Gonzalo Humacata',
      rol: rol,
      verificado: true
    }).select();
    console.log(`Rol '${rol}':`, error ? "ERROR: " + error.message : "SUCCESS!");
    if (!error) break;
  }
}

testRoles();
