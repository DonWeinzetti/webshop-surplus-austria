import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL fehlt");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt");

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function supabaseBucketName() {
  return process.env.SUPABASE_BUCKET || "product-images";
}
