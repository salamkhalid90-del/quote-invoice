import { saveInvoice } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const [clients, materials, settings] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.companySetting.findUnique({ where: { id: 1 } })
  ]);
  return (
    <>
      <PageHeader title="إنشاء فاتورة مباشرة" subtitle="فاتورة مستقلة مع بنود ودفعات لاحقة" />
      <QuoteForm
        action={saveInvoice}
        clients={clients}
        materials={materials}
        mode="invoice"
        submitLabel="حفظ الفاتورة"
        defaults={{
          currency: settings?.defaultCurrency || "IQD",
          terms: settings?.defaultTerms,
          items: [{ category: "Electrical Works", description: "", qty: 1, unit: "pcs", unitPrice: 0, markup: settings?.defaultMarkup || 20, cost: 0 }]
        }}
      />
    </>
  );
}
