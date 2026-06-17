import Link from "next/link";
import { deleteInvoice } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { formatMoney, totals } from "@/lib/calc";
import { ButtonLink, Card, DeleteButton, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({ include: { client: true, items: true, payments: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="الفواتير" subtitle="تحويل الكوتيشنات أو إنشاء فواتير مباشرة وتسجيل الدفعات" action={<ButtonLink href="/invoices/new">فاتورة جديدة</ButtonLink>} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-right">الرقم</th>
                <th className="p-3 text-right">العميل</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">الإجمالي</th>
                <th className="p-3 text-right">المدفوع</th>
                <th className="p-3 text-right">المتبقي</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const sum = totals(invoice.items, invoice.discount, invoice.taxRate);
                const paid = invoice.payments.reduce((total, payment) => total + payment.amount, 0);
                return (
                  <tr key={invoice.id} className="border-t">
                    <td className="p-3 font-semibold"><Link href={`/invoices/${invoice.id}`}>{invoice.invoiceNo}</Link></td>
                    <td className="p-3">{invoice.client.name}</td>
                    <td className="p-3">{invoice.status}</td>
                    <td className="p-3">{formatMoney(sum.totalSelling, invoice.currency)}</td>
                    <td className="p-3 text-emerald-700">{formatMoney(paid, invoice.currency)}</td>
                    <td className="p-3 text-rose-700">{formatMoney(Math.max(sum.totalSelling - paid, 0), invoice.currency)}</td>
                    <td className="flex gap-2 p-3">
                      <Link href={`/invoices/${invoice.id}/edit`} className="rounded border px-3 py-2">تعديل</Link>
                      <form action={deleteInvoice}><input type="hidden" name="id" value={invoice.id} /><DeleteButton /></form>
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
