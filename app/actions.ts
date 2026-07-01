"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceStatus, QuoteStatus } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { numberValue, optionalString, requiredString } from "@/lib/actions-utils";

async function saveUploadedImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || !file.size) return null;
  const extension = path.extname(file.name).toLowerCase() || ".png";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
  const uploadDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeName), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${safeName}`;
}

export async function saveClient(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const data = {
    name: requiredString(formData, "name"),
    phone: optionalString(formData, "phone"),
    address: optionalString(formData, "address"),
    projectName: optionalString(formData, "projectName"),
    notes: optionalString(formData, "notes")
  };

  if (id) await prisma.client.update({ where: { id }, data });
  else await prisma.client.create({ data });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteClient(formData: FormData) {
  await prisma.client.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function saveMaterial(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const data = {
    name: requiredString(formData, "name"),
    category: requiredString(formData, "category"),
    brand: optionalString(formData, "brand"),
    model: optionalString(formData, "model"),
    cost: numberValue(formData, "cost"),
    defaultSellingPrice: numberValue(formData, "defaultSellingPrice"),
    supplier: optionalString(formData, "supplier"),
    notes: optionalString(formData, "notes")
  };
  if (id) await prisma.material.update({ where: { id }, data });
  else await prisma.material.create({ data });
  revalidatePath("/materials");
  redirect("/materials");
}

export async function deleteMaterial(formData: FormData) {
  await prisma.material.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/materials");
  redirect("/materials");
}

export async function saveSettings(formData: FormData) {
  const uploadedLogoUrl = await saveUploadedImage(formData.get("logoFile"));
  const uploadedWatermarkLogoUrl = await saveUploadedImage(formData.get("watermarkLogoFile"));
  const logoUrl = uploadedLogoUrl || optionalString(formData, "logoUrl");
  const watermarkLogoUrl = uploadedWatermarkLogoUrl || optionalString(formData, "watermarkLogoUrl");
  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {
      name: requiredString(formData, "name"),
      logoUrl,
      watermarkLogoUrl,
      address: requiredString(formData, "address"),
      phones: requiredString(formData, "phones"),
      email: requiredString(formData, "email"),
      website: optionalString(formData, "website"),
      defaultCurrency: requiredString(formData, "defaultCurrency"),
      defaultMarkup: numberValue(formData, "defaultMarkup", 20),
      defaultTerms: requiredString(formData, "defaultTerms"),
      defaultPaymentPlan: requiredString(formData, "defaultPaymentPlan")
    },
    create: {
      id: 1,
      name: requiredString(formData, "name"),
      logoUrl,
      watermarkLogoUrl,
      address: requiredString(formData, "address"),
      phones: requiredString(formData, "phones"),
      email: requiredString(formData, "email"),
      website: optionalString(formData, "website"),
      defaultCurrency: requiredString(formData, "defaultCurrency"),
      defaultMarkup: numberValue(formData, "defaultMarkup", 20),
      defaultTerms: requiredString(formData, "defaultTerms"),
      defaultPaymentPlan: requiredString(formData, "defaultPaymentPlan")
    }
  });
  revalidatePath("/settings");
  redirect("/settings");
}

export async function addPartnerCompany(formData: FormData) {
  const logoUrl = (await saveUploadedImage(formData.get("partnerLogoFile"))) || optionalString(formData, "logoUrl");
  if (!logoUrl) redirect("/settings");
  await prisma.partnerCompany.create({
    data: {
      name: requiredString(formData, "name"),
      logoUrl,
      website: optionalString(formData, "website")
    }
  });
  revalidatePath("/settings");
  redirect("/settings");
}

export async function deletePartnerCompany(formData: FormData) {
  await prisma.partnerCompany.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/settings");
  redirect("/settings");
}

async function nextNumber(prefix: "Q" | "INV", model: "quote" | "invoice") {
  const year = new Date().getFullYear();
  const startsWith = `${prefix}-${year}-`;
  const lastNumber =
    model === "quote"
      ? (await prisma.quote.findFirst({ where: { quoteNo: { startsWith } }, orderBy: { quoteNo: "desc" }, select: { quoteNo: true } }))?.quoteNo
      : (await prisma.invoice.findFirst({ where: { invoiceNo: { startsWith } }, orderBy: { invoiceNo: "desc" }, select: { invoiceNo: true } }))?.invoiceNo;
  const previous = lastNumber ? Number(lastNumber.split("-").pop()) : 0;
  return `${startsWith}${String(previous + 1).padStart(4, "0")}`;
}

function parsedItems(formData: FormData) {
  const raw = String(formData.get("itemsJson") || "[]");
  const items = JSON.parse(raw) as Array<Record<string, unknown>>;
  return items
    .filter((item) => String(item.description || "").trim())
    .map((item, index) => ({
      sortOrder: index + 1,
      category: String(item.category || "Miscellaneous"),
      description: String(item.description || ""),
      qty: Number(item.qty || 0),
      unit: String(item.unit || "pcs"),
      unitPrice: Number(item.unitPrice || 0),
      markup: Number(item.markup || 0),
      cost: Number(item.cost || 0),
      notes: item.notes ? String(item.notes) : null
    }));
}

export async function saveQuote(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const items = parsedItems(formData);
  const data = {
    quoteNo: requiredString(formData, "quoteNo"),
    documentTitle: requiredString(formData, "documentTitle") || "كوتيشن",
    issueDate: new Date(requiredString(formData, "issueDate")),
    expiryDate: optionalString(formData, "expiryDate") ? new Date(requiredString(formData, "expiryDate")) : null,
    status: requiredString(formData, "status") as QuoteStatus,
    clientId: numberValue(formData, "clientId"),
    projectName: optionalString(formData, "projectName"),
    projectLocation: optionalString(formData, "projectLocation"),
    workDescription: optionalString(formData, "workDescription"),
    currency: requiredString(formData, "currency"),
    discount: numberValue(formData, "discount"),
    taxRate: numberValue(formData, "taxRate"),
    advancePayment: numberValue(formData, "advancePayment"),
    paymentPlan: optionalString(formData, "paymentPlan"),
    terms: optionalString(formData, "terms"),
    notes: optionalString(formData, "notes"),
    showItemPrices: formData.get("showItemPrices") === "on",
    showItemTotals: formData.get("showItemTotals") === "on",
    showDiscount: formData.get("showDiscount") === "on",
    showTax: formData.get("showTax") === "on",
    showGrandTotal: formData.get("showGrandTotal") === "on",
    showAdvancePayment: formData.get("showAdvancePayment") === "on",
    showPaymentPlan: formData.get("showPaymentPlan") === "on",
    showTerms: formData.get("showTerms") === "on",
    showCostProfit: formData.get("showCostProfit") === "on"
  };

  if (id) {
    await prisma.quote.update({
      where: { id },
      data: {
        ...data,
        items: { deleteMany: {}, create: items }
      }
    });
    revalidatePath(`/quotes/${id}`);
    redirect(`/quotes/${id}`);
  }

  const quote = await prisma.quote.create({
    data: {
      ...data,
      quoteNo: data.quoteNo || (await nextNumber("Q", "quote")),
      items: { create: items }
    }
  });
  revalidatePath("/quotes");
  redirect(`/quotes/${quote.id}`);
}

export async function deleteQuote(formData: FormData) {
  await prisma.quote.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/quotes");
  redirect("/quotes");
}

export async function duplicateQuote(formData: FormData) {
  const original = await prisma.quote.findUnique({
    where: { id: Number(formData.get("id")) },
    include: { items: true }
  });
  if (!original) redirect("/quotes");
  const quote = await prisma.quote.create({
    data: {
      quoteNo: await nextNumber("Q", "quote"),
      documentTitle: original.documentTitle,
      issueDate: new Date(),
      expiryDate: original.expiryDate,
      status: "DRAFT",
      clientId: original.clientId,
      projectName: `${original.projectName || ""} - نسخة`.trim(),
      projectLocation: original.projectLocation,
      workDescription: original.workDescription,
      currency: original.currency,
      discount: original.discount,
      taxRate: original.taxRate,
      advancePayment: original.advancePayment,
      paymentPlan: original.paymentPlan,
      terms: original.terms,
      notes: original.notes,
      showItemPrices: original.showItemPrices,
      showItemTotals: original.showItemTotals,
      showDiscount: original.showDiscount,
      showTax: original.showTax,
      showGrandTotal: original.showGrandTotal,
      showAdvancePayment: original.showAdvancePayment,
      showPaymentPlan: original.showPaymentPlan,
      showTerms: original.showTerms,
      showCostProfit: original.showCostProfit,
      items: {
        create: original.items.map((item) => ({
          sortOrder: item.sortOrder,
          category: item.category,
          description: item.description,
          qty: item.qty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          markup: item.markup,
          cost: item.cost,
          notes: item.notes
        }))
      }
    }
  });
  redirect(`/quotes/${quote.id}/edit`);
}

export async function convertQuoteToInvoice(formData: FormData) {
  const quote = await prisma.quote.findUnique({
    where: { id: Number(formData.get("id")) },
    include: { items: true, invoice: true }
  });
  if (!quote) redirect("/quotes");
  if (quote.invoice) redirect(`/invoices/${quote.invoice.id}`);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: await nextNumber("INV", "invoice"),
      issueDate: new Date(),
      status: "UNPAID",
      clientId: quote.clientId,
      quoteId: quote.id,
      projectName: quote.projectName,
      projectLocation: quote.projectLocation,
      workDescription: quote.workDescription,
      currency: quote.currency,
      discount: quote.discount,
      taxRate: quote.taxRate,
      terms: quote.terms,
      notes: quote.notes,
      items: {
        create: quote.items.map((item) => ({
          sortOrder: item.sortOrder,
          category: item.category,
          description: item.description,
          qty: item.qty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          markup: item.markup,
          cost: item.cost,
          notes: item.notes
        }))
      }
    }
  });
  await prisma.quote.update({ where: { id: quote.id }, data: { status: "ACCEPTED" } });
  redirect(`/invoices/${invoice.id}`);
}

export async function saveInvoice(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const items = parsedItems(formData);
  const data = {
    issueDate: new Date(requiredString(formData, "issueDate")),
    dueDate: optionalString(formData, "dueDate") ? new Date(requiredString(formData, "dueDate")) : null,
    status: requiredString(formData, "status") as InvoiceStatus,
    clientId: numberValue(formData, "clientId"),
    projectName: optionalString(formData, "projectName"),
    projectLocation: optionalString(formData, "projectLocation"),
    workDescription: optionalString(formData, "workDescription"),
    currency: requiredString(formData, "currency"),
    discount: numberValue(formData, "discount"),
    taxRate: numberValue(formData, "taxRate"),
    terms: optionalString(formData, "terms"),
    notes: optionalString(formData, "notes")
  };

  if (id) {
    await prisma.invoice.update({
      where: { id },
      data: { ...data, items: { deleteMany: {}, create: items } }
    });
    redirect(`/invoices/${id}`);
  }

  const invoice = await prisma.invoice.create({
    data: { invoiceNo: await nextNumber("INV", "invoice"), ...data, items: { create: items } }
  });
  redirect(`/invoices/${invoice.id}`);
}

export async function deleteInvoice(formData: FormData) {
  await prisma.invoice.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function addPayment(formData: FormData) {
  const invoiceId = Number(formData.get("invoiceId"));
  await prisma.payment.create({
    data: {
      invoiceId,
      paidAt: new Date(requiredString(formData, "paidAt")),
      amount: numberValue(formData, "amount"),
      notes: optionalString(formData, "notes")
    }
  });

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { items: true, payments: true } });
  if (invoice) {
    const total = invoice.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const tax = Math.max(total - invoice.discount, 0) * (invoice.taxRate / 100);
    const due = Math.max(total - invoice.discount, 0) + tax;
    const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: paid >= due ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "UNPAID" }
    });
  }

  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}`);
}
