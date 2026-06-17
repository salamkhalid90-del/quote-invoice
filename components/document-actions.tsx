"use client";

import { Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PdfRow = {
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export function DocumentActions({
  title,
  fileName,
  rows,
  totals,
  showPrices = true,
  showItemTotals = true
}: {
  title: string;
  fileName: string;
  rows: PdfRow[];
  totals: Record<string, string>;
  showPrices?: boolean;
  showItemTotals?: boolean;
}) {
  function exportPdf() {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const head = ["Category", "Description", "Qty", "Unit"];
    if (showPrices) head.push("Unit Price");
    if (showItemTotals) head.push("Total");

    doc.setFontSize(16);
    doc.text(title, 40, 42);
    autoTable(doc, {
      startY: 70,
      head: [head],
      body: rows.map((row) => {
        const cells: Array<string | number> = [row.category, row.description, row.qty, row.unit];
        if (showPrices) cells.push(row.unitPrice.toLocaleString("en-US"));
        if (showItemTotals) cells.push(row.total.toLocaleString("en-US"));
        return cells;
      }),
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [15, 39, 66] }
    });
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 90;
    let y = finalY + 24;
    Object.entries(totals).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 40, y);
      y += 18;
    });
    doc.save(fileName);
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Printer className="h-4 w-4" />
        Print
      </button>
      <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-md bg-[#c8912f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a9761f]">
        <Download className="h-4 w-4" />
        Export PDF
      </button>
    </div>
  );
}
