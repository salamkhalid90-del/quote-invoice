import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney, totals } from "@/lib/calc";
import { ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [quotes, invoices] = await Promise.all([
    prisma.quote.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.invoice.findMany({ include: { items: true, payments: true }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);
  const allQuotes = await prisma.quote.findMany({ include: { items: true } });
  const allInvoices = await prisma.invoice.findMany({ include: { items: true } });

  const sales = allInvoices.reduce((sum, invoice) => sum + totals(invoice.items, invoice.discount, invoice.taxRate).totalSelling, 0);
  const profit = allQuotes.reduce((sum, quote) => sum + totals(quote.items, quote.discount, quote.taxRate, quote.advancePayment).netProfit, 0);
  const pendingQuotes = await prisma.quote.count({ where: { status: { in: ["DRAFT", "SENT"] } } });
  const paidInvoices = await prisma.invoice.count({ where: { status: "PAID" } });
  const unpaidInvoices = await prisma.invoice.count({ where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } } });

  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة سريعة على الكوتيشنات والفواتير والأرباح"
        action={<ButtonLink href="/quotes/new">كوتيشن جديد</ButtonLink>}
      />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="عدد الكوتيشنات" value={String(allQuotes.length)} />
        <StatCard label="عدد الفواتير" value={String(allInvoices.length)} />
        <StatCard label="إجمالي المبيعات" value={formatMoney(sales)} tone="gold" />
        <StatCard label="إجمالي الأرباح" value={formatMoney(profit)} tone="green" />
        <StatCard label="كوتيشنات قيد الانتظار" value={String(pendingQuotes)} />
        <StatCard label="مدفوعة / غير مدفوعة" value={`${paidInvoices} / ${unpaidInvoices}`} tone="red" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-[#0f2742]">آخر الكوتيشنات</h3>
            <Link href="/quotes" className="text-sm text-[#c8912f]">عرض الكل</Link>
          </div>
          <div className="space-y-2">
            {quotes.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`} className="flex items-center justify-between rounded border p-3 hover:bg-slate-50">
                <span>{quote.quoteNo}</span>
                <span className="text-sm text-slate-500">{formatMoney(totals(quote.items, quote.discount, quote.taxRate).totalSelling, quote.currency)}</span>
              </Link>
            ))}
            {!quotes.length ? <Empty label="لا توجد كوتيشنات بعد" /> : null}
          </div>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-[#0f2742]">آخر الفواتير</h3>
            <Link href="/invoices" className="text-sm text-[#c8912f]">عرض الكل</Link>
          </div>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="flex items-center justify-between rounded border p-3 hover:bg-slate-50">
                <span>{invoice.invoiceNo}</span>
                <span className="text-sm text-slate-500">{invoice.status}</span>
              </Link>
            ))}
            {!invoices.length ? <Empty label="لا توجد فواتير بعد" /> : null}
          </div>
        </Card>
      </div>
      <Link href="/quotes/new" className="fixed bottom-5 left-5 inline-flex h-13 w-13 items-center justify-center rounded-full bg-[#c8912f] text-white shadow-lg lg:hidden">
        <FilePlus2 className="h-6 w-6" />
      </Link>
    </>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="rounded border border-dashed p-6 text-center text-sm text-slate-500">{label}</p>;
}
