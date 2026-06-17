import { redirect } from "next/navigation";

export function requiredString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function optionalString(formData: FormData, key: string) {
  const value = requiredString(formData, key);
  return value || null;
}

export function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export function redirectBack(path: string) {
  redirect(path);
}
