import Link from "next/link";
import { deleteClient } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/client-form";
import { ButtonLink, Card, DeleteButton, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ include: { quotes: true, invoices: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="العملاء" subtitle="إدارة بيانات العملاء وسجل المشاريع" action={<ButtonLink href="/quotes/new" variant="secondary">إنشاء كوتيشن</ButtonLink>} />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h3 className="mb-4 font-bold text-[#0f2742]">إضافة عميل جديد</h3>
          <ClientForm />
        </Card>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3 text-right">العميل</th>
                  <th className="p-3 text-right">الهاتف</th>
                  <th className="p-3 text-right">المشروع</th>
                  <th className="p-3 text-right">الكوتيشنات</th>
                  <th className="p-3 text-right">الفواتير</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t">
                    <td className="p-3 font-semibold">{client.name}</td>
                    <td className="p-3">{client.phone}</td>
                    <td className="p-3">{client.projectName}</td>
                    <td className="p-3">{client.quotes.length}</td>
                    <td className="p-3">{client.invoices.length}</td>
                    <td className="flex gap-2 p-3">
                      <Link href={`/clients/${client.id}`} className="rounded border px-3 py-2">تفاصيل</Link>
                      <form action={deleteClient}><input type="hidden" name="id" value={client.id} /><DeleteButton /></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
