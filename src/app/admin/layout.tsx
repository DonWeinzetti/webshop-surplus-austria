export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-theme min-h-screen p-6">{children}</div>;
}
