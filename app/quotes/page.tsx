import Link from "next/link";
import { deleteQuote, duplicateQuote, convertQuoteToInvoice } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { formatMoney, totals } from "@/lib/calc";
import { ButtonLink, Card, DeleteButton, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({ include: { client: true, items: true, invoice: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="الكوتيشنات" subtitle="إنشاء وتعديل واستنساخ وتحويل عروض الأسعار" action={<ButtonLink href="/quotes/new">كوتيشن جديد</ButtonLink>} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-right">الرقم</th>
                <th className="p-3 text-right">العميل</th>
                <th className="p-3 text-right">المشروع</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">الإجمالي</th>
                <th className="p-3 text-right">الربح</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const sum = totals(quote.items, quote.discount, quote.taxRate, quote.advancePayment);
                return (
                  <tr key={quote.id} className="border-t">
                    <td className="p-3 font-semibold"><Link href={`/quotes/${quote.id}`}>{quote.quoteNo}</Link></td>
                    <td className="p-3">{quote.client.name}</td>
                    <td className="p-3">{quote.projectName}</td>
                    <td className="p-3">{quote.status}</td>
                    <td className="p-3">{formatMoney(sum.totalSelling, quote.currency)}</td>
                    <td className="p-3 text-emerald-700">{formatMoney(sum.netProfit, quote.currency)}</td>
                    <td className="flex flex-wrap gap-2 p-3">
                      <Link href={`/quotes/${quote.id}/edit`} className="rounded border px-3 py-2">تعديل</Link>
                      <form action={duplicateQuote}><input type="hidden" name="id" value={quote.id} /><button className="rounded border px-3 py-2">Duplicate</button></form>
                      <form action={convertQuoteToInvoice}><input type="hidden" name="id" value={quote.id} /><button className="rounded bg-[#c8912f] px-3 py-2 text-white">Convert</button></form>
                      <form action={deleteQuote}><input type="hidden" name="id" value={quote.id} /><DeleteButton /></form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
