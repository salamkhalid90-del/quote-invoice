import Link from "next/link";
import { clsx } from "clsx";

export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2742]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-[#0f2742] text-white hover:bg-[#173a61]"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("rounded-md border border-slate-200 bg-white p-5 shadow-sm", className)}>{children}</section>;
}

export function StatCard({ label, value, tone = "navy" }: { label: string; value: string; tone?: "navy" | "gold" | "green" | "red" }) {
  const tones = {
    navy: "border-[#0f2742]/15 text-[#0f2742]",
    gold: "border-[#c8912f]/25 text-[#9a6815]",
    green: "border-emerald-200 text-emerald-700",
    red: "border-rose-200 text-rose-700"
  };
  return (
    <Card className={clsx("border-r-4", tones[tone])}>
      <p className="text-sm text-slate-500">{label}</p>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </Card>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#c8912f] focus:ring-2 focus:ring-[#c8912f]/20";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit" className="rounded-md bg-[#0f2742] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173a61]">
      {children}
    </button>
  );
}

export function DeleteButton({ children = "حذف" }: { children?: React.ReactNode }) {
  return (
    <button type="submit" className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
      {children}
    </button>
  );
}
