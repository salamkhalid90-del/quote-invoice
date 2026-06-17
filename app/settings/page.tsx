import { addPartnerCompany, deletePartnerCompany, saveSettings } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { Card, DeleteButton, Field, inputClass, PageHeader, SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, partners] = await Promise.all([
    prisma.companySetting.findUnique({ where: { id: 1 } }),
    prisma.partnerCompany.findMany({ orderBy: { createdAt: "desc" } })
  ]);
  return (
    <>
      <PageHeader title="إعدادات الشركة" subtitle="بيانات تظهر في PDF والطباعة والنماذج الجديدة" />
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <Card>
          <form action={saveSettings} className="grid gap-4 md:grid-cols-2">
            <Field label="اسم الشركة"><input name="name" defaultValue={settings?.name || ""} className={inputClass} required /></Field>
            <Field label="رابط الشعار أو رفع ملف">
              <input name="logoUrl" defaultValue={settings?.logoUrl || ""} className={inputClass} placeholder="/uploads/logo.png أو رابط خارجي" />
              <input name="logoFile" type="file" accept="image/*" className="mt-2 block w-full text-sm text-slate-600" />
            </Field>
            {settings?.logoUrl ? (
              <div className="md:col-span-2 rounded-md border bg-slate-50 p-3">
                <p className="mb-2 text-sm text-slate-500">الشعار الحالي</p>
                <img src={settings.logoUrl} alt="Company logo" className="h-16 max-w-52 object-contain" />
              </div>
            ) : null}
            <Field label="لوغو شفاف في خلفية الطباعة">
              <input name="watermarkLogoUrl" defaultValue={settings?.watermarkLogoUrl || ""} className={inputClass} placeholder="/uploads/watermark.png أو رابط خارجي" />
              <input name="watermarkLogoFile" type="file" accept="image/*" className="mt-2 block w-full text-sm text-slate-600" />
            </Field>
            {settings?.watermarkLogoUrl ? (
              <div className="rounded-md border bg-slate-50 p-3">
                <p className="mb-2 text-sm text-slate-500">لوغو الخلفية الحالي</p>
                <img src={settings.watermarkLogoUrl} alt="Watermark logo" className="h-16 max-w-52 object-contain opacity-60" />
              </div>
            ) : null}
            <Field label="العنوان"><input name="address" defaultValue={settings?.address || ""} className={inputClass} required /></Field>
            <Field label="أرقام الهاتف"><input name="phones" defaultValue={settings?.phones || ""} className={inputClass} required /></Field>
            <Field label="البريد الإلكتروني"><input name="email" defaultValue={settings?.email || ""} className={inputClass} required /></Field>
            <Field label="الموقع الإلكتروني"><input name="website" defaultValue={settings?.website || ""} className={inputClass} /></Field>
            <Field label="العملة الافتراضية">
              <select name="defaultCurrency" defaultValue={settings?.defaultCurrency || "IQD"} className={inputClass}>
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
              </select>
            </Field>
            <Field label="نسبة الربح الافتراضية"><input name="defaultMarkup" type="number" defaultValue={settings?.defaultMarkup || 20} className={inputClass} /></Field>
            <div className="md:col-span-2">
              <Field label="نصوص الشروط الافتراضية"><textarea name="defaultTerms" defaultValue={settings?.defaultTerms || ""} rows={6} className={inputClass} /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="خطة الدفع الافتراضية"><textarea name="defaultPaymentPlan" defaultValue={settings?.defaultPaymentPlan || ""} rows={4} className={inputClass} /></Field>
            </div>
            <div className="md:col-span-2"><SubmitButton>حفظ الإعدادات</SubmitButton></div>
          </form>
        </Card>
        <div className="space-y-5">
          <Card>
            <h3 className="mb-4 font-bold text-[#0f2742]">شركات البارتنر</h3>
            <form action={addPartnerCompany} className="space-y-3">
              <Field label="اسم الشركة"><input name="name" className={inputClass} required /></Field>
              <Field label="رفع شعار البارتنر"><input name="partnerLogoFile" type="file" accept="image/*" className="block w-full text-sm text-slate-600" /></Field>
              <Field label="أو رابط الشعار"><input name="logoUrl" className={inputClass} placeholder="https://..." /></Field>
              <Field label="الموقع الإلكتروني"><input name="website" className={inputClass} /></Field>
              <SubmitButton>إضافة بارتنر</SubmitButton>
            </form>
          </Card>
          <Card>
            <h3 className="mb-4 font-bold text-[#0f2742]">الشعارات الحالية</h3>
            <div className="space-y-3">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <img src={partner.logoUrl} alt="" className="h-10 w-16 object-contain" />
                    <div>
                      <p className="font-semibold">{partner.name}</p>
                      {partner.website ? <p className="text-xs text-slate-500">{partner.website}</p> : null}
                    </div>
                  </div>
                  <form action={deletePartnerCompany}>
                    <input type="hidden" name="id" value={partner.id} />
                    <DeleteButton />
                  </form>
                </div>
              ))}
              {!partners.length ? <p className="text-sm text-slate-500">لم تتم إضافة شركات بارتنر بعد.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
