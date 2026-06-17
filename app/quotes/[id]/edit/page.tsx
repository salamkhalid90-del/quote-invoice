import { notFound } from "next/navigation";
import { saveQuote } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, clients, materials] = await Promise.all([
    prisma.quote.findUnique({ where: { id: Number(id) }, include: { items: { orderBy: { sortOrder: "asc" } } } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!quote) notFound();
  return (
    <>
      <PageHeader title={`تعديل ${quote.quoteNo}`} subtitle="تحديث بيانات العرض والبنود والحسابات" />
      <QuoteForm
        action={saveQuote}
        clients={clients}
        materials={materials}
        mode="quote"
        submitLabel="حفظ التعديلات"
        defaults={{
          ...quote,
          items: quote.items.map((item) => ({
            category: item.category,
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            markup: item.markup,
            cost: item.cost,
            notes: item.notes
          }))
        }}
      />
    </>
  );
}
