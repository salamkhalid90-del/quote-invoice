import Link from "next/link";
import { notFound } from "next/navigation";
import { convertQuoteToInvoice, duplicateQuote } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { formatMoney, totals } from "@/lib/calc";
import { DocumentActions } from "@/components/document-actions";
import { ButtonLink, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, company, partners] = await Promise.all([
    prisma.quote.findUnique({
      where: { id: Number(id) },
      include: { client: true, items: { orderBy: { sortOrder: "asc" } }, invoice: true }
    }),
    prisma.companySetting.findUnique({ where: { id: 1 } }),
    prisma.partnerCompany.findMany({ orderBy: { createdAt: "desc" } })
  ]);
  if (!quote) notFound();
  const sum = totals(quote.items, quote.discount, quote.taxRate, quote.advancePayment);
  const hideMoney = !quote.showItemPrices && !quote.showItemTotals;
  const quantitySummary = {
    itemLines: quote.items.length,
    totalQuantity: quote.items.reduce((total, item) => total + item.qty, 0)
  };
  const pdfTotals: Record<string, string> = {};
  pdfTotals["Item Lines"] = String(quantitySummary.itemLines);
  pdfTotals["Total Qty"] = String(quantitySummary.totalQuantity);
  if (!hideMoney && quote.showGrandTotal) pdfTotals.Subtotal = formatMoney(sum.subtotal, quote.currency);
  if (!hideMoney && quote.showDiscount) pdfTotals.Discount = formatMoney(sum.discount, quote.currency);
  if (!hideMoney && quote.showTax) pdfTotals.Tax = formatMoney(sum.tax, quote.currency);
  if (!hideMoney && quote.showGrandTotal) pdfTotals.Total = formatMoney(sum.totalSelling, quote.currency);
  if (!hideMoney && quote.showCostProfit) pdfTotals.Profit = formatMoney(sum.netProfit, quote.currency);
  if (!hideMoney && quote.showAdvancePayment) pdfTotals.Remaining = formatMoney(sum.remainingBalance, quote.currency);
  return (
    <>
      <PageHeader
        title={quote.quoteNo}
        subtitle={`${quote.client.name} - ${quote.projectName || ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/quotes/${quote.id}/edit`} variant="secondary">تعديل</ButtonLink>
            <form action={duplicateQuote}><input type="hidden" name="id" value={quote.id} /><button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Duplicate Quote</button></form>
            <form action={convertQuoteToInvoice}><input type="hidden" name="id" value={quote.id} /><button className="rounded-md bg-[#c8912f] px-4 py-2 text-sm font-semibold text-white">Convert to Invoice</button></form>
            <DocumentActions
              title={`${quote.documentTitle} ${quote.quoteNo}`}
              fileName={`${quote.quoteNo}.pdf`}
              rows={quote.items.map((item) => ({ category: item.category, description: item.description, qty: item.qty, unit: item.unit, unitPrice: item.unitPrice, total: item.qty * item.unitPrice }))}
              totals={pdfTotals}
              showPrices={quote.showItemPrices}
              showItemTotals={quote.showItemTotals}
            />
          </div>
        }
      />
      <Card className="print-surface relative overflow-hidden">
        <DocumentHeader company={company} partners={partners} title={quote.documentTitle} number={quote.quoteNo} />
        <div className="mt-6 grid gap-4 border-y py-4 text-sm md:grid-cols-3">
          <Info label="العميل" value={quote.client.name} />
          <Info label="الهاتف" value={quote.client.phone || "-"} />
          <Info label="المشروع" value={quote.projectName || "-"} />
          <Info label="موقع المشروع" value={quote.projectLocation || "-"} />
          <Info label="تاريخ الإصدار" value={quote.issueDate.toLocaleDateString("ar-IQ")} />
          <Info label="صلاحية العرض" value={quote.expiryDate?.toLocaleDateString("ar-IQ") || "-"} />
        </div>
        {quote.workDescription ? <p className="mt-4 rounded bg-slate-50 p-3 text-sm">{quote.workDescription}</p> : null}
        <DocumentTable items={quote.items} currency={quote.currency} showPrices={quote.showItemPrices} showItemTotals={quote.showItemTotals} />
        <QuantitySummary itemLines={quantitySummary.itemLines} totalQuantity={quantitySummary.totalQuantity} />
        <TotalsBlock
          sum={sum}
          currency={quote.currency}
          showAdvance={!hideMoney && quote.showAdvancePayment}
          showDiscount={!hideMoney && quote.showDiscount}
          showTax={!hideMoney && quote.showTax}
          showGrandTotal={!hideMoney && quote.showGrandTotal}
          showCostProfit={!hideMoney && quote.showCostProfit}
        />
        {(quote.showPaymentPlan || quote.showTerms) ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quote.showPaymentPlan ? <Terms title="شروط الدفع" text={quote.paymentPlan || ""} /> : null}
            {quote.showTerms ? <Terms title="الشروط والملاحظات" text={quote.terms || ""} /> : null}
          </div>
        ) : null}
        <Signature />
      </Card>
      {quote.invoice ? <p className="mt-4 text-sm text-slate-600">تم تحويله إلى فاتورة: <Link className="text-[#c8912f]" href={`/invoices/${quote.invoice.id}`}>{quote.invoice.invoiceNo}</Link></p> : null}
    </>
  );
}

export function DocumentHeader({
  company,
  partners = [],
  title,
  number
}: {
  company: { name: string; address: string; phones: string; email: string; website: string | null; logoUrl: string | null; watermarkLogoUrl?: string | null } | null;
  partners?: Array<{ name: string; logoUrl: string; website: string | null }>;
  title: string;
  number: string;
}) {
  return (
    <div>
      {company?.watermarkLogoUrl ? (
        <img src={company.watermarkLogoUrl} alt="" className="pointer-events-none absolute left-1/2 top-1/2 z-0 max-h-[55%] max-w-[65%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-8" />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2742]">{company?.name || "Smart Engineering Company"}</h2>
          <p className="mt-1 text-sm text-slate-500">{company?.address}</p>
          <p className="text-sm text-slate-500">{company?.phones} | {company?.email}</p>
          {company?.website ? <p className="text-sm text-slate-500">{company.website}</p> : null}
        </div>
        <div className="text-left">
          {company?.logoUrl ? <img src={company.logoUrl} alt="" className="mb-2 mr-auto h-14 object-contain" /> : null}
          <h1 className="text-xl font-bold text-[#c8912f]">{title}</h1>
          <p className="text-sm text-slate-500">{number}</p>
        </div>
      </div>
      {partners.length ? (
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-4">
          {partners.map((partner) => (
            <img key={partner.name} src={partner.logoUrl} alt={partner.name} title={partner.name} className="h-8 max-w-24 object-contain" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-slate-500">{label}</p><strong>{value}</strong></div>;
}

export function DocumentTable({
  items,
  currency,
  showPrices = true,
  showItemTotals = true
}: {
  items: Array<{ category: string; description: string; qty: number; unit: string; unitPrice: number; cost: number; markup: number; notes: string | null }>;
  currency: string;
  showPrices?: boolean;
  showItemTotals?: boolean;
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-[#0f2742] text-white">
          <tr>
            <th className="p-3 text-right">#</th>
            <th className="p-3 text-right">Category</th>
            <th className="p-3 text-right">Description</th>
            <th className="p-3 text-right">Qty</th>
            <th className="p-3 text-right">Unit</th>
            {showPrices ? <th className="p-3 text-right">Unit Price</th> : null}
            {showItemTotals ? <th className="p-3 text-right">Total</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.description}-${index}`} className="border-b">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">{item.category}</td>
              <td className="p-3">{item.description}</td>
              <td className="p-3">{item.qty}</td>
              <td className="p-3">{item.unit}</td>
              {showPrices ? <td className="p-3">{formatMoney(item.unitPrice, currency)}</td> : null}
              {showItemTotals ? <td className="p-3 font-semibold">{formatMoney(item.qty * item.unitPrice, currency)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuantitySummary({ itemLines, totalQuantity }: { itemLines: number; totalQuantity: number }) {
  return (
    <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
      <div className="flex items-center justify-between rounded bg-white px-4 py-3">
        <span className="text-slate-500">عدد البنود</span>
        <strong className="text-[#0f2742]">{itemLines}</strong>
      </div>
      <div className="flex items-center justify-between rounded bg-white px-4 py-3">
        <span className="text-slate-500">مجموع الكميات النهائي</span>
        <strong className="text-[#0f2742]">{totalQuantity}</strong>
      </div>
    </div>
  );
}

export function TotalsBlock({
  sum,
  currency,
  showAdvance = false,
  showDiscount = true,
  showTax = true,
  showGrandTotal = true,
  showCostProfit = true
}: {
  sum: ReturnType<typeof totals>;
  currency: string;
  showAdvance?: boolean;
  showDiscount?: boolean;
  showTax?: boolean;
  showGrandTotal?: boolean;
  showCostProfit?: boolean;
}) {
  return (
    <div className="mr-auto mt-6 w-full max-w-md rounded-md border bg-slate-50 p-4 text-sm">
      {showGrandTotal ? <Row label="Subtotal" value={formatMoney(sum.subtotal, currency)} /> : null}
      {showDiscount ? <Row label="Discount" value={formatMoney(sum.discount, currency)} /> : null}
      {showTax ? <Row label="Tax / VAT" value={formatMoney(sum.tax, currency)} /> : null}
      {showCostProfit ? <Row label="Total Cost" value={formatMoney(sum.totalCost, currency)} /> : null}
      {showGrandTotal ? <Row label="Total Selling Price" value={formatMoney(sum.totalSelling, currency)} strong /> : null}
      {showCostProfit ? <Row label="Net Profit" value={`${formatMoney(sum.netProfit, currency)} (${sum.profitPercentage.toFixed(1)}%)`} /> : null}
      {showAdvance ? <Row label="Advance / Remaining" value={`${formatMoney(sum.advancePayment, currency)} / ${formatMoney(sum.remainingBalance, currency)}`} /> : null}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex justify-between border-b py-2 last:border-b-0"><span>{label}</span><span className={strong ? "font-bold text-[#0f2742]" : "font-semibold"}>{value}</span></div>;
}

export function Terms({ title, text }: { title: string; text: string }) {
  return <div className="rounded-md border p-4"><h3 className="mb-2 font-bold text-[#0f2742]">{title}</h3><p className="whitespace-pre-wrap text-sm text-slate-600">{text || "-"}</p></div>;
}

export function Signature() {
  return <div className="mt-10 flex justify-between text-sm text-slate-500"><span>توقيع العميل</span><span>توقيع وختم الشركة</span></div>;
}
