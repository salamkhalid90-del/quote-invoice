export type MoneyItem = {
  qty: number;
  unitPrice: number;
  cost: number;
};

export function totals(items: MoneyItem[], discount = 0, taxRate = 0, advancePayment = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const totalCost = items.reduce((sum, item) => sum + item.qty * item.cost, 0);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * (taxRate / 100);
  const totalSelling = taxable + tax;
  const netProfit = totalSelling - totalCost;
  const profitPercentage = totalSelling > 0 ? (netProfit / totalSelling) * 100 : 0;
  const remainingBalance = Math.max(totalSelling - advancePayment, 0);

  return {
    subtotal,
    discount,
    tax,
    totalCost,
    totalSelling,
    netProfit,
    profitPercentage,
    advancePayment,
    remainingBalance
  };
}

export function formatMoney(value: number, currency = "IQD") {
  return new Intl.NumberFormat("ar-IQ", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IQD" ? 0 : 2
  }).format(value || 0);
}

export function dateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}
