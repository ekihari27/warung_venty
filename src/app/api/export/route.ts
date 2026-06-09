import { NextRequest, NextResponse } from "next/server";
import { generateExcelReport } from "@/lib/excel";
import { DataService } from "@/lib/dataService";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "sales";

  try {
    let buffer: ArrayBuffer;

    if (type === "sales") {
      const sales = await DataService.getSales();
      const rows = sales.map((s, idx) => [
        idx + 1,
        s.invoiceNumber,
        (s as { cashier?: { name: string } }).cashier?.name || "-",
        new Date(s.createdAt).toLocaleString("id-ID"),
        s.paymentMethod,
        s.totalPrice,
        s.tax,
        s.finalPrice,
        s.paidAmount,
        s.changeAmount,
      ]);

      buffer = await generateExcelReport({
        title: "Laporan Penjualan - WARUNG VENTY",
        subtitle: `Periode: ${new Date().toLocaleDateString("id-ID")}`,
        userName: user.name,
        headers: [
          { header: "No", key: "no", width: 5 },
          { header: "Invoice", key: "invoice", width: 20 },
          { header: "Kasir", key: "kasir", width: 15 },
          { header: "Tanggal", key: "tanggal", width: 20 },
          { header: "Metode", key: "metode", width: 10 },
          { header: "Subtotal", key: "subtotal", width: 15 },
          { header: "Pajak", key: "pajak", width: 12 },
          { header: "Total", key: "total", width: 15 },
          { header: "Dibayar", key: "dibayar", width: 15 },
          { header: "Kembali", key: "kembali", width: 12 },
        ],
        rows,
        summaryRows: [
          {
            label: "Total Transaksi",
            colSpan: 4,
            value: sales.length,
          },
          {
            label: "Total Pendapatan",
            colSpan: 4,
            value: sales.reduce((sum, s) => sum + s.finalPrice, 0),
            isCurrency: true,
          },
        ],
      });
    } else if (type === "inventory") {
      const batches = await DataService.getStockBatches();
      const rows = batches.map((b, idx) => [
        idx + 1,
        (b as { product?: { name: string } }).product?.name || "-",
        (b as { supplier?: { name: string } }).supplier?.name || "-",
        b.initialQty,
        b.remainingQty,
        b.purchasePrice,
        b.remainingQty * b.purchasePrice,
        new Date(b.receivedAt).toLocaleDateString("id-ID"),
      ]);

      buffer = await generateExcelReport({
        title: "Laporan Inventaris - WARUNG VENTY",
        subtitle: `Per tanggal: ${new Date().toLocaleDateString("id-ID")}`,
        userName: user.name,
        headers: [
          { header: "No", key: "no", width: 5 },
          { header: "Produk", key: "produk", width: 25 },
          { header: "Supplier", key: "supplier", width: 20 },
          { header: "Qty Awal", key: "qtyAwal", width: 10 },
          { header: "Qty Tersisa", key: "qtyTersisa", width: 12 },
          { header: "Harga Modal", key: "hargaModal", width: 15 },
          { header: "Nilai", key: "nilai", width: 15 },
          { header: "Tanggal Masuk", key: "tanggal", width: 15 },
        ],
        rows,
        summaryRows: [
          {
            label: "Total Stok",
            colSpan: 3,
            value: batches.reduce((sum, b) => sum + b.remainingQty, 0),
          },
          {
            label: "Total Nilai Persediaan",
            colSpan: 3,
            value: batches.reduce((sum, b) => sum + b.remainingQty * b.purchasePrice, 0),
            isCurrency: true,
          },
        ],
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Log audit
    await DataService.addAuditLog({
      userId: user.id,
      userName: user.name,
      action: "Export Laporan",
      details: `Export laporan ${type} ke Excel`,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-${type}-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
