
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ next?: string; err?: string }> | { next?: string; err?: string };
};

async function unwrapSearchParams(sp: PageProps["searchParams"]) {
  if (!sp) return {};
  return typeof (sp as any)?.then === "function" ? await (sp as Promise<any>) : (sp as any);
}

async function loginAction(formData: FormData) {
  "use server";

  const secret = String(formData.get("secret") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!process.env.ADMIN_SECRET) {
    throw new Error("ADMIN_SECRET fehlt in .env.local");
  }

  if (secret !== process.env.ADMIN_SECRET) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}&err=1`);
  }

  // ✅ Next 16: cookies() ist async
  const cookieStore = await cookies();
  cookieStore.set("admin_secret", secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect(nextPath || "/admin");
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const sp = await unwrapSearchParams(searchParams);
  const nextPath = sp?.next ? String(sp.next) : "/admin";
  const err = String((sp as any)?.err ?? "") === "1";
  const missing = String((sp as any)?.err ?? "") === "missing";


  // ✅ Next 16: cookies() ist async
  const cookieStore = await cookies();
  const existing = cookieStore.get("admin_secret")?.value;

  // optional: wenn schon eingeloggt → direkt weiter
  if (existing && process.env.ADMIN_SECRET && existing === process.env.ADMIN_SECRET) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4 bg-white">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-gray-600">
            Bitte Admin-Secret eingeben (aus <span className="font-mono">.env.local</span>).
          </p>
        </div>

        {err ? (
          <div className="text-sm rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
            Falsches Secret.
          </div>
        ) : null}

        <form action={loginAction} className="space-y-3">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">ADMIN_SECRET</div>
            <input
              name="secret"
              type="password"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              placeholder="••••••••••"
              autoFocus
              required
            />
          </label>

          <button className="w-full rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
            Einloggen
          </button>
        </form>

        <div className="text-xs text-gray-500">
          Weiterleitung nach: <span className="font-mono">{nextPath}</span>
        </div>
      </div>
    </div>
  );
}
