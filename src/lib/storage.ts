const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";

export function supabasePublicUrl(path?: string | null) {
  if (!path) return null;
  // public bucket URL format:
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
