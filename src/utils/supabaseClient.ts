import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://cboajmbpiqglesncgvve.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2FqbWJwaXFnbGVzbmNndnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzAyODQsImV4cCI6MjEwNjI0NjI4NH0.ET3HkfOKUU_DE8V0HA8EYqwNazX16FeR6s2JrTP03Wc';

// Safe fetch wrapper with 4-second timeout to handle DNS failure / network firewall without freezing UI
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 4000);
  
  const options = {
    ...init,
    signal: init?.signal || controller.signal,
  };

  return fetch(input, options)
    .finally(() => clearTimeout(id));
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});
