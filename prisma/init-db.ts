import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "CompanySetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Smart Engineering Company',
    "logoUrl" TEXT,
    "watermarkLogoUrl" TEXT,
    "address" TEXT NOT NULL DEFAULT 'Baghdad, Iraq',
    "phones" TEXT NOT NULL DEFAULT '+964 000 000 0000',
    "email" TEXT NOT NULL DEFAULT 'info@example.com',
    "website" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'IQD',
    "defaultMarkup" REAL NOT NULL DEFAULT 20,
    "defaultTerms" TEXT NOT NULL DEFAULT 'الأسعار لا تشمل الأعمال غير المذكورة.
أي تغيير في المخططات يعتبر كلفة إضافية.
صلاحية العرض حسب التاريخ المذكور.
الضمان حسب شروط الشركة المصنعة والتنفيذ.',
    "defaultPaymentPlan" TEXT NOT NULL DEFAULT '50% عند المباشرة
30% بعد التأسيس أو التوريد
20% عند التسليم',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "projectName" TEXT,
    "notes" TEXT,
    "showItemPrices" BOOLEAN NOT NULL DEFAULT true,
    "showItemTotals" BOOLEAN NOT NULL DEFAULT true,
    "showDiscount" BOOLEAN NOT NULL DEFAULT true,
    "showTax" BOOLEAN NOT NULL DEFAULT true,
    "showGrandTotal" BOOLEAN NOT NULL DEFAULT true,
    "showAdvancePayment" BOOLEAN NOT NULL DEFAULT true,
    "showPaymentPlan" BOOLEAN NOT NULL DEFAULT true,
    "showTerms" BOOLEAN NOT NULL DEFAULT true,
    "showCostProfit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "PartnerCompany" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "defaultSellingPrice" REAL NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Quote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteNo" TEXT NOT NULL,
    "documentTitle" TEXT NOT NULL DEFAULT 'كوتيشن',
    "issueDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "clientId" INTEGER NOT NULL,
    "projectName" TEXT,
    "projectLocation" TEXT,
    "workDescription" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IQD',
    "discount" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "advancePayment" REAL NOT NULL DEFAULT 0,
    "paymentPlan" TEXT,
    "terms" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "QuoteItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "qty" REAL NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "markup" REAL NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNo" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "clientId" INTEGER NOT NULL,
    "quoteId" INTEGER,
    "projectName" TEXT,
    "projectLocation" TEXT,
    "workDescription" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IQD',
    "discount" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "terms" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "InvoiceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "qty" REAL NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "markup" REAL NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "paidAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Quote_quoteNo_key" ON "Quote"("quoteNo")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_quoteId_key" ON "Invoice"("quoteId")`
];

const migrations = [
  `ALTER TABLE "CompanySetting" ADD COLUMN "watermarkLogoUrl" TEXT`,
  `ALTER TABLE "Quote" ADD COLUMN "documentTitle" TEXT NOT NULL DEFAULT 'كوتيشن'`,
  `ALTER TABLE "Quote" ADD COLUMN "showItemPrices" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showItemTotals" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showDiscount" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showTax" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showGrandTotal" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showAdvancePayment" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showPaymentPlan" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showTerms" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Quote" ADD COLUMN "showCostProfit" BOOLEAN NOT NULL DEFAULT false`
];

async function main() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
  for (const statement of migrations) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (error) {
      if (!String(error).includes("duplicate column name")) throw error;
    }
  }
  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });
}

main()
  .then(() => console.log("SQLite database is ready."))
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
