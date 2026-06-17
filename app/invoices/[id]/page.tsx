import { notFound } from "next/navigation";
import { addPayment } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { dateInputValue, formatMoney, totals } from "@/lib/calc";
import { DocumentActions } from "@/components/document-actions";
import { ButtonLink, Card, Field, inputClass, PageHeader, SubmitButton } from "@/components/ui";
import { DocumentHeader, DocumentTable, Info, Signature, Terms, TotalsBlock } from "@/app/quotes/[id]/page";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, company, partners] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: { client: true, items: { orderBy: { sortOrder: "asc" } }, payments: { orderBy: { paidAt: "desc" } }, quote: true }
    }),
    prisma.companySetting.findUnique({ where: { id: 1 } }),
    prisma.partnerCompany.findMany({ orderBy: { createdAt: "desc" } })
  ]);
  if (!invoice) notFound();
  const sum = totals(invoice.items, invoice.discount, invoice.taxRate);
  const paid = invoice.payments.reduce((total, payment) => total + payment.amount, 0);
  const remaining = Math.max(sum.totalSelling - paid, 0);

  return (
    <>
      <PageHeader
        title={invoice.invoiceNo}
        subtitle={`${invoice.client.name} - ${invoice.status}`}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/invoices/${invoice.id}/edit`} variant="secondary">تعديل</ButtonLink>
            <DocumentActions
              title={`Invoice ${invoice.invoiceNo}`}
              fileName={`${invoice.invoiceNo}.pdf`}
              rows={invoice.items.map((item) => ({ category: item.category, description: item.description, qty: item.qty, unit: item.unit, unitPrice: item.unitPrice, total: item.qty * item.unitPrice }))}
              totals={{
                Total: formatMoney(sum.totalSelling, invoice.currency),
                Paid: formatMoney(paid, invoice.currency),
                Remaining: formatMoney(remaining, invoice.currency)
              }}
            />
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="print-surface">
          <DocumentHeader company={company} partners={partners} title="فاتورة / Invoice" number={invoice.invoiceNo} />
          <div className="mt-6 grid gap-4 border-y py-4 text-sm md:grid-cols-3">
            <Info label="العميل" value={invoice.client.name} />
            <Info label="الهاتف" value={invoice.client.phone || "-"} />
            <Info label="المشروع" value={invoice.projectName || "-"} />
            <Info label="تاريخ الإصدار" value={invoice.issueDate.toLocaleDateString("ar-IQ")} />
            <Info label="تاريخ الاستحقاق" value={invoice.dueDate?.toLocaleDateString("ar-IQ") || "-"} />
            <Info label="الحالة" value={invoice.status} />
          </div>
          <DocumentTable items={invoice.items} currency={invoice.currency} />
          <TotalsBlock sum={{ ...sum, advancePayment: paid, remainingBalance: remaining }} currency={invoice.currency} showAdvance />
          <div className="mt-6">
            <Terms title="الشروط والملاحظات" text={invoice.terms || ""} />
          </div>
          <Signature />
        </Card>
        <aside className="no-print space-y-5">
          <Card>
            <h3 className="mb-3 font-bold text-[#0f2742]">تسجيل دفعة</h3>
            <form action={addPayment} className="space-y-3">
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <Field label="تاريخ الدفعة"><input name="paidAt" type="date" defaultValue={dateInputValue(new Date())} className={inputClass} /></Field>
              <Field label="المبلغ المدفوع"><input name="amount" type="number" className={inputClass} required /></Field>
              <Field label="ملاحظات"><textarea name="notes" rows={3} className={inputClass} /></Field>
              <SubmitButton>إضافة الدفعة</SubmitButton>
            </form>
          </Card>
          <Card>
            <h3 className="mb-3 font-bold text-[#0f2742]">سجل الدفعات</h3>
            <div className="space-y-2 text-sm">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="rounded border p-3">
                  <div className="flex justify-between"><span>{payment.paidAt.toLocaleDateString("ar-IQ")}</span><strong>{formatMoney(payment.amount, invoice.currency)}</strong></div>
                  {payment.notes ? <p className="mt-1 text-slate-500">{payment.notes}</p> : null}
                </div>
              ))}
              {!invoice.payments.length ? <p className="text-slate-500">لا توجد دفعات مسجلة.</p> : null}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
