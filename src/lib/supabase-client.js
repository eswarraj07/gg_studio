import { createClient } from "@supabase/supabase-js";

let supabase;

export function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  supabase = createClient(url, key);
  return supabase;
}
