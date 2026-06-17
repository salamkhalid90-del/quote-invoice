import { saveClient } from "@/app/actions";
import { Field, inputClass, SubmitButton } from "@/components/ui";

export function ClientForm({
  client
}: {
  client?: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    projectName: string | null;
    notes: string | null;
  };
}) {
  return (
    <form action={saveClient} className="space-y-3">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      <Field label="اسم العميل"><input name="name" defaultValue={client?.name || ""} className={inputClass} required /></Field>
      <Field label="رقم الهاتف"><input name="phone" defaultValue={client?.phone || ""} className={inputClass} /></Field>
      <Field label="العنوان"><input name="address" defaultValue={client?.address || ""} className={inputClass} /></Field>
      <Field label="اسم المشروع"><input name="projectName" defaultValue={client?.projectName || ""} className={inputClass} /></Field>
      <Field label="ملاحظات"><textarea name="notes" defaultValue={client?.notes || ""} rows={4} className={inputClass} /></Field>
      <SubmitButton>{client ? "حفظ التعديلات" : "إضافة العميل"}</SubmitButton>
    </form>
  );
}
