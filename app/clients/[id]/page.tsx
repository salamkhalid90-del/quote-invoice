import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/client-form";
import { prisma } from "@/lib/prisma";
import { formatMoney, totals } from "@/lib/calc";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: Number(id) },
    include: { quotes: { include: { items: true } }, invoices: { include: { items: true } } }
  });
  if (!client) notFound();
  return (
    <>
      <PageHeader title={client.name} subtitle="بيانات العميل وسجل الكوتيشنات والفواتير" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h3 className="mb-4 font-bold text-[#0f2742]">تعديل بيانات العميل</h3>
          <ClientForm client={client} />
        </Card>
        <div className="space-y-5">
          <Card>
            <h3 className="mb-3 font-bold text-[#0f2742]">الكوتيشنات</h3>
            <div className="space-y-2">
              {client.quotes.map((quote) => (
                <Link key={quote.id} href={`/quotes/${quote.id}`} className="flex justify-between rounded border p-3 hover:bg-slate-50">
                  <span>{quote.quoteNo}</span>
                  <span>{formatMoney(totals(quote.items, quote.discount, quote.taxRate).totalSelling, quote.currency)}</span>
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 font-bold text-[#0f2742]">الفواتير</h3>
            <div className="space-y-2">
              {client.invoices.map((invoice) => (
                <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="flex justify-between rounded border p-3 hover:bg-slate-50">
                  <span>{invoice.invoiceNo}</span>
                  <span>{formatMoney(totals(invoice.items, invoice.discount, invoice.taxRate).totalSelling, invoice.currency)}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
