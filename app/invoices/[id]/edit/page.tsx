import { notFound } from "next/navigation";
import { saveInvoice } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, clients, materials] = await Promise.all([
    prisma.invoice.findUnique({ where: { id: Number(id) }, include: { items: { orderBy: { sortOrder: "asc" } } } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!invoice) notFound();
  return (
    <>
      <PageHeader title={`تعديل ${invoice.invoiceNo}`} subtitle="تحديث الفاتورة والبنود" />
      <QuoteForm
        action={saveInvoice}
        clients={clients}
        materials={materials}
        mode="invoice"
        submitLabel="حفظ التعديلات"
        defaults={{
          ...invoice,
          items: invoice.items.map((item) => ({
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
