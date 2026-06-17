import { saveQuote } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const [clients, materials, settings] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.companySetting.findUnique({ where: { id: 1 } })
  ]);
  return (
    <>
      <PageHeader title="إنشاء كوتيشن" subtitle="عرض سعر كامل مع حسابات الربح والدفعات" />
      <QuoteForm
        action={saveQuote}
        clients={clients}
        materials={materials}
        mode="quote"
        submitLabel="حفظ الكوتيشن"
        defaults={{
          currency: settings?.defaultCurrency || "IQD",
          documentTitle: "كوتيشن",
          taxRate: 0,
          paymentPlan: settings?.defaultPaymentPlan,
          terms: settings?.defaultTerms,
          items: [{ category: "Electrical Works", description: "", qty: 1, unit: "pcs", unitPrice: 0, markup: settings?.defaultMarkup || 20, cost: 0 }]
        }}
      />
    </>
  );
}
