import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between">
        <nav className="flex gap-6 text-[11px] tracked uppercase text-muted">
          <Link href="/admin/products" className="hover:text-ink transition-colors">Products</Link>
          <Link href="/admin/brands" className="hover:text-ink transition-colors">Brands</Link>
          <Link href="/admin/coming-soon" className="hover:text-ink transition-colors">Coming Soon</Link>
        </nav>
        <form action={logout}>
          <button className="text-[11px] tracked uppercase text-muted hover:text-ink transition-colors">
            Log Out
          </button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
