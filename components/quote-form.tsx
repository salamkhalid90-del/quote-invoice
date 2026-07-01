"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { categories, paymentPlans, units } from "@/lib/constants";
import { dateInputValue, formatMoney, totals } from "@/lib/calc";
import { Field, inputClass, SubmitButton } from "@/components/ui";

export type FormClient = { id: number; name: string; projectName: string | null };
export type FormMaterial = {
  id: number;
  name: string;
  category: string;
  cost: number;
  defaultSellingPrice: number;
};
export type LineItem = {
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  markup: number;
  cost: number;
  notes?: string | null;
};

export function QuoteForm({
  action,
  clients,
  materials,
  defaults,
  submitLabel,
  mode
}: {
  action: (formData: FormData) => void;
  clients: FormClient[];
  materials: FormMaterial[];
  defaults: {
    id?: number;
    quoteNo?: string;
    documentTitle?: string;
    clientId?: number;
    issueDate?: Date | string;
    expiryDate?: Date | string | null;
    dueDate?: Date | string | null;
    status?: string;
    projectName?: string | null;
    projectLocation?: string | null;
    workDescription?: string | null;
    currency?: string;
    discount?: number;
    taxRate?: number;
    advancePayment?: number;
    paymentPlan?: string | null;
    terms?: string | null;
    notes?: string | null;
    showItemPrices?: boolean;
    showItemTotals?: boolean;
    showDiscount?: boolean;
    showTax?: boolean;
    showGrandTotal?: boolean;
    showAdvancePayment?: boolean;
    showPaymentPlan?: boolean;
    showTerms?: boolean;
    showCostProfit?: boolean;
    items?: LineItem[];
  };
  submitLabel: string;
  mode: "quote" | "invoice";
}) {
  const [items, setItems] = useState<LineItem[]>(
    defaults.items?.length
      ? defaults.items
      : [{ category: "Electrical Works", description: "", qty: 1, unit: "pcs", unitPrice: 0, markup: 20, cost: 0, notes: "" }]
  );
  const [discount, setDiscount] = useState(defaults.discount || 0);
  const [taxRate, setTaxRate] = useState(defaults.taxRate || 0);
  const [advancePayment, setAdvancePayment] = useState(defaults.advancePayment || 0);
  const [currency, setCurrency] = useState(defaults.currency || "IQD");

  const summary = useMemo(() => totals(items, discount, taxRate, mode === "quote" ? advancePayment : 0), [items, discount, taxRate, advancePayment, mode]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function chooseMaterial(index: number, materialId: string) {
    const material = materials.find((entry) => entry.id === Number(materialId));
    if (!material) return;
    updateItem(index, {
      category: material.category,
      description: material.name,
      unitPrice: material.defaultSellingPrice,
      cost: material.cost
    });
  }

  return (
    <form action={action} className="space-y-6">
      {defaults.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />

      <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        {mode === "quote" ? (
          <Field label="رقم الكوتيشن">
            <input name="quoteNo" defaultValue={defaults.quoteNo || ""} placeholder="يولّد تلقائياً عند تركه فارغاً" className={inputClass} />
          </Field>
        ) : null}
        {mode === "quote" ? (
          <Field label="عنوان المستند">
            <select name="documentTitle" defaultValue={defaults.documentTitle || "كوتيشن"} className={inputClass}>
              <option value="كوتيشن">كوتيشن</option>
              <option value="قائمة مواد مبيعات">قائمة مواد مبيعات</option>
              <option value="عرض سعر أعمال تنفيذية">عرض سعر أعمال تنفيذية</option>
            </select>
          </Field>
        ) : null}
        <Field label="العميل">
          <select name="clientId" defaultValue={defaults.clientId} className={inputClass} required>
            <option value="">اختر العميل</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="تاريخ الإصدار">
          <input name="issueDate" type="date" defaultValue={dateInputValue(defaults.issueDate || new Date())} className={inputClass} required />
        </Field>
        <Field label={mode === "quote" ? "تاريخ انتهاء العرض" : "تاريخ الاستحقاق"}>
          <input name={mode === "quote" ? "expiryDate" : "dueDate"} type="date" defaultValue={dateInputValue(mode === "quote" ? defaults.expiryDate : defaults.dueDate)} className={inputClass} />
        </Field>
        <Field label="الحالة">
          <select name="status" defaultValue={defaults.status || (mode === "quote" ? "DRAFT" : "UNPAID")} className={inputClass}>
            {mode === "quote" ? (
              <>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </>
            ) : (
              <>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
              </>
            )}
          </select>
        </Field>
        <Field label="اسم المشروع">
          <input name="projectName" defaultValue={defaults.projectName || ""} className={inputClass} />
        </Field>
        <Field label="موقع المشروع">
          <input name="projectLocation" defaultValue={defaults.projectLocation || ""} className={inputClass} />
        </Field>
        <Field label="العملة">
          <select name="currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputClass}>
            <option value="IQD">IQD</option>
            <option value="USD">USD</option>
          </select>
        </Field>
        <Field label="وصف عام للعمل">
          <textarea name="workDescription" defaultValue={defaults.workDescription || ""} rows={2} className={inputClass} />
        </Field>
      </section>

      {mode === "quote" ? (
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-[#0f2742]">التحكم بما يظهر في الطباعة وملف PDF</h3>
          <p className="mb-4 text-sm text-slate-500">
            لعرض قائمة مواد بدون أسعار تفصيلية: أطفئ سعر الوحدة ومجموع كل بند، واترك المجموع النهائي مفعلاً.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PrintToggle name="showItemPrices" label="إظهار سعر الوحدة" checked={defaults.showItemPrices ?? true} />
            <PrintToggle name="showItemTotals" label="إظهار مجموع كل بند" checked={defaults.showItemTotals ?? true} />
            <PrintToggle name="showDiscount" label="إظهار التخفيض" checked={defaults.showDiscount ?? true} />
            <PrintToggle name="showTax" label="إظهار الضريبة / VAT" checked={defaults.showTax ?? true} />
            <PrintToggle name="showGrandTotal" label="إظهار المجموع النهائي" checked={defaults.showGrandTotal ?? true} />
            <PrintToggle name="showAdvancePayment" label="إظهار الدفعة المقدمة والمتبقي" checked={defaults.showAdvancePayment ?? true} />
            <PrintToggle name="showPaymentPlan" label="إظهار شروط الدفع" checked={defaults.showPaymentPlan ?? true} />
            <PrintToggle name="showTerms" label="إظهار الشروط والملاحظات" checked={defaults.showTerms ?? true} />
            <PrintToggle name="showCostProfit" label="إظهار الكلفة والربح" checked={defaults.showCostProfit ?? false} />
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-[#0f2742]">جدول البنود</h3>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, { category: "Miscellaneous", description: "", qty: 1, unit: "pcs", unitPrice: 0, markup: 20, cost: 0, notes: "" }])}
            className="inline-flex items-center gap-2 rounded-md bg-[#0f2742] px-3 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            إضافة بند
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2 text-right">#</th>
                <th className="p-2 text-right">استدعاء مادة</th>
                <th className="p-2 text-right">Category</th>
                <th className="p-2 text-right">Description</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Unit</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Cost</th>
                <th className="p-2 text-right">Markup %</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    <select onChange={(event) => chooseMaterial(index, event.target.value)} className={inputClass} defaultValue="">
                      <option value="">اختيار</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select value={item.category} onChange={(event) => updateItem(index, { category: event.target.value })} className={inputClass}>
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} className={inputClass} />
                  </td>
                  <td className="p-2">
                    <input type="number" value={item.qty} onChange={(event) => updateItem(index, { qty: Number(event.target.value) })} className={inputClass} />
                  </td>
                  <td className="p-2">
                    <select value={item.unit} onChange={(event) => updateItem(index, { unit: event.target.value })} className={inputClass}>
                      {units.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })} className={inputClass} />
                  </td>
                  <td className="p-2">
                    <input type="number" value={item.cost} onChange={(event) => updateItem(index, { cost: Number(event.target.value) })} className={inputClass} />
                  </td>
                  <td className="p-2">
                    <input type="number" value={item.markup} onChange={(event) => updateItem(index, { markup: Number(event.target.value) })} className={inputClass} />
                  </td>
                  <td className="p-2 font-semibold">{formatMoney(item.qty * item.unitPrice, currency)}</td>
                  <td className="p-2">
                    <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="rounded border border-rose-200 p-2 text-rose-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <Field label="Discount">
          <input name="discount" type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className={inputClass} />
        </Field>
        <Field label="VAT / Tax %">
          <input name="taxRate" type="number" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} className={inputClass} />
        </Field>
        {mode === "quote" ? (
          <Field label="Advance Payment">
            <input name="advancePayment" type="number" value={advancePayment} onChange={(event) => setAdvancePayment(Number(event.target.value))} className={inputClass} />
          </Field>
        ) : null}
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Net Profit</p>
          <strong className="text-lg text-emerald-700">{formatMoney(summary.netProfit, currency)}</strong>
          <p className="text-xs text-slate-500">{summary.profitPercentage.toFixed(1)}%</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        {mode === "quote" ? (
          <Field label="خطة الدفع">
            <select onChange={(event) => event.currentTarget.nextElementSibling && ((event.currentTarget.nextElementSibling as HTMLTextAreaElement).value = event.target.value)} className={inputClass} defaultValue="">
              <option value="">اختيار قالب</option>
              {paymentPlans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan.split("\n").join(" / ")}
                </option>
              ))}
            </select>
            <textarea name="paymentPlan" defaultValue={defaults.paymentPlan || paymentPlans[0]} rows={4} className={`${inputClass} mt-2`} />
          </Field>
        ) : null}
        <Field label="الشروط والملاحظات">
          <textarea name="terms" defaultValue={defaults.terms || ""} rows={mode === "quote" ? 6 : 4} className={inputClass} />
        </Field>
        <Field label="ملاحظات داخلية">
          <textarea name="notes" defaultValue={defaults.notes || ""} rows={4} className={inputClass} />
        </Field>
      </section>

      <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-5 text-sm shadow-sm md:grid-cols-4">
        <Summary label="Subtotal" value={formatMoney(summary.subtotal, currency)} />
        <Summary label="Total Cost" value={formatMoney(summary.totalCost, currency)} />
        <Summary label="Total Selling" value={formatMoney(summary.totalSelling, currency)} />
        <Summary label="Remaining" value={formatMoney(summary.remainingBalance, currency)} />
      </section>

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <strong className="text-[#0f2742]">{value}</strong>
    </div>
  );
}

function PrintToggle({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-[#0f2742]" />
      <span>{label}</span>
    </label>
  );
}
