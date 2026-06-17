import { deleteMaterial, saveMaterial } from "@/app/actions";
import { categories } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/calc";
import { Card, DeleteButton, Field, inputClass, PageHeader, SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="المواد والأسعار" subtitle="قاعدة أسعار قابلة للاستدعاء داخل الكوتيشن" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h3 className="mb-4 font-bold text-[#0f2742]">إضافة مادة</h3>
          <MaterialForm />
        </Card>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3 text-right">المادة</th>
                  <th className="p-3 text-right">التصنيف</th>
                  <th className="p-3 text-right">الماركة</th>
                  <th className="p-3 text-right">الموديل</th>
                  <th className="p-3 text-right">الكلفة</th>
                  <th className="p-3 text-right">سعر البيع</th>
                  <th className="p-3 text-right">المورد</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className="border-t">
                    <td className="p-3 font-semibold">{material.name}</td>
                    <td className="p-3">{material.category}</td>
                    <td className="p-3">{material.brand}</td>
                    <td className="p-3">{material.model}</td>
                    <td className="p-3">{formatMoney(material.cost)}</td>
                    <td className="p-3">{formatMoney(material.defaultSellingPrice)}</td>
                    <td className="p-3">{material.supplier}</td>
                    <td className="p-3">
                      <form action={deleteMaterial}><input type="hidden" name="id" value={material.id} /><DeleteButton /></form>
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

function MaterialForm() {
  return (
    <form action={saveMaterial} className="space-y-3">
      <Field label="اسم المادة"><input name="name" className={inputClass} required /></Field>
      <Field label="التصنيف">
        <select name="category" className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
      </Field>
      <Field label="الماركة"><input name="brand" className={inputClass} /></Field>
      <Field label="الموديل"><input name="model" className={inputClass} /></Field>
      <Field label="الكلفة"><input name="cost" type="number" className={inputClass} /></Field>
      <Field label="سعر البيع الافتراضي"><input name="defaultSellingPrice" type="number" className={inputClass} /></Field>
      <Field label="المورد"><input name="supplier" className={inputClass} /></Field>
      <Field label="ملاحظات"><textarea name="notes" rows={3} className={inputClass} /></Field>
      <SubmitButton>حفظ المادة</SubmitButton>
    </form>
  );
}
