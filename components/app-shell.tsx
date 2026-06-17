import Link from "next/link";
import {
  Boxes,
  Building2,
  FileText,
  Home,
  Receipt,
  Settings,
  Users
} from "lucide-react";

const nav = [
  { href: "/", label: "لوحة التحكم", icon: Home },
  { href: "/clients", label: "العملاء", icon: Users },
  { href: "/quotes", label: "الكوتيشنات", icon: FileText },
  { href: "/invoices", label: "الفواتير", icon: Receipt },
  { href: "/materials", label: "المواد والأسعار", icon: Boxes },
  { href: "/settings", label: "إعدادات الشركة", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside className="no-print fixed inset-y-0 right-0 z-20 hidden w-72 border-l border-slate-200 bg-[#0f2742] text-white lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-11 w-11 place-items-center rounded bg-[#c8912f]">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/70">Smart Quote</p>
            <h1 className="font-bold">Invoice Manager</h1>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-white/82 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-5 w-5 text-[#f1b44c]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pr-72">
        <header className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <strong>Smart Quote & Invoice Manager</strong>
            <Link href="/quotes/new" className="rounded bg-[#0f2742] px-3 py-2 text-sm text-white">
              كوتيشن جديد
            </Link>
          </div>
          <nav className="mt-3 flex gap-2 overflow-auto pb-1 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded border px-3 py-2">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
