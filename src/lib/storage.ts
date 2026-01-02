// src/lib/storage.ts

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "product-images";

/**
 * Baut eine öffentliche Supabase-Storage-URL
 * Beispiel path:
 *   "parts/k98k/kimme/kimme-1-thumb.jpg"
 */
export function supabasePublicUrl(path?: string | null): string | null {
  if (!path) return null;

  if (!SUPABASE_URL) {
    // In Development laut, in Production defensiv
    if (process.env.NODE_ENV !== "production") {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
    }
    return null;
  }

  // Slashes sauber normalisieren
  const cleanBucket = BUCKET.replace(/^\/+|\/+$/g, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${SUPABASE_URL}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
}
