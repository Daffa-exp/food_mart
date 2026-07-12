import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export interface SalesReportRow {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  deliveryMethod: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export interface SalesReportSummary {
  dateFrom: string;
  dateTo: string;
  totalRevenue: number;
  successOrderCount: number;
  totalOrderCount: number;
}

const BRAND = "F5821F"; // primary-500 — samain sama warna brand di web
const INK_900 = "1F2937";
const INK_700 = "4B5563";
const INK_400 = "9CA3AF";
const BORDER = "E5E7EB";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Refund",
};

const PAYMENT_LABEL: Record<string, string> = {
  settlement: "Lunas",
  pending: "Menunggu",
  deny: "Ditolak",
  cancel: "Dibatalkan",
  expire: "Kedaluwarsa",
  refund: "Refund",
};

const DELIVERY_LABEL: Record<string, string> = {
  regular: "Reguler",
  same_day: "Same Day",
  instant: "Instant",
};

function formatDateID(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

// =========================================================
// EXCEL (.xlsx) — pakai ExcelJS supaya hasilnya file Excel asli
// (bisa dibuka & diedit di Excel/Google Sheets), bukan CSV yang
// cuma diganti namanya jadi .xlsx.
// =========================================================
export async function generateSalesExcel(rows: SalesReportRow[], summary: SalesReportSummary): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FoodMart Admin Panel";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Laporan Penjualan", {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  sheet.columns = [
    { width: 4 },   // No
    { width: 18 },  // Order Number
    { width: 14 },  // Tanggal
    { width: 24 },  // Customer
    { width: 26 },  // Email
    { width: 8 },   // Item
    { width: 14 },  // Pengiriman
    { width: 18 },  // Status Order
    { width: 16 },  // Status Bayar
    { width: 18 },  // Total
  ];

  // --- Header brand ---
  sheet.mergeCells("A1:J1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "FoodMart — Laporan Penjualan";
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 28;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND}` } };
  });

  sheet.mergeCells("A2:J2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = `Periode ${formatDateID(summary.dateFrom)} – ${formatDateID(summary.dateTo)}  •  Digenerate ${new Date().toLocaleString("id-ID")}`;
  subtitleCell.font = { italic: true, size: 10, color: { argb: `FF${INK_400}` } };
  sheet.getRow(2).height = 18;

  // --- Ringkasan ---
  const summaryRows: [string, string][] = [
    ["Total Revenue (Order Lunas)", formatRupiah(summary.totalRevenue)],
    ["Order Berhasil", `${summary.successOrderCount}`],
    ["Total Order (Semua Status)", `${summary.totalOrderCount}`],
  ];
  let r = 4;
  for (const [label, value] of summaryRows) {
    sheet.getCell(`A${r}`).value = label;
    sheet.getCell(`A${r}`).font = { size: 10, color: { argb: `FF${INK_700}` } };
    sheet.mergeCells(`B${r}:C${r}`);
    sheet.getCell(`B${r}`).value = value;
    sheet.getCell(`B${r}`).font = { bold: true, size: 11, color: { argb: `FF${INK_900}` } };
    r++;
  }

  // --- Tabel data ---
  const headerRowIndex = r + 1;
  const headers = ["No", "Order Number", "Tanggal", "Customer", "Email", "Item", "Pengiriman", "Status Order", "Status Bayar", "Total"];
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = headers;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${INK_900}` } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { bottom: { style: "thin", color: { argb: `FF${BORDER}` } } };
  });
  headerRow.height = 20;
  sheet.views = [{ state: "frozen", ySplit: headerRowIndex }];

  rows.forEach((row, i) => {
    const excelRow = sheet.addRow([
      i + 1,
      row.orderNumber,
      formatDateID(row.createdAt),
      row.customerName,
      row.customerEmail,
      row.itemCount,
      DELIVERY_LABEL[row.deliveryMethod] ?? row.deliveryMethod,
      STATUS_LABEL[row.status] ?? row.status,
      PAYMENT_LABEL[row.paymentStatus] ?? row.paymentStatus,
      row.totalAmount,
    ]);
    excelRow.eachCell((cell, colNumber) => {
      cell.border = { bottom: { style: "thin", color: { argb: `FF${BORDER}` } } };
      cell.font = { size: 10, color: { argb: `FF${INK_700}` } };
      if (colNumber === 1 || colNumber === 6) cell.alignment = { horizontal: "center" };
      if (colNumber === 10) {
        cell.numFmt = '"Rp"#,##0';
        cell.font = { size: 10, bold: true, color: { argb: `FF${INK_900}` } };
      }
    });
    if (i % 2 === 1) {
      excelRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      });
    }
  });

  // --- Baris total ---
  const totalRow = sheet.addRow(["", "", "", "", "", "", "", "", "TOTAL", rows.reduce((s, r2) => s + r2.totalAmount, 0)]);
  sheet.mergeCells(`A${totalRow.number}:H${totalRow.number}`);
  totalRow.getCell(9).font = { bold: true, size: 10, color: { argb: `FF${INK_900}` } };
  totalRow.getCell(9).alignment = { horizontal: "right" };
  totalRow.getCell(10).numFmt = '"Rp"#,##0';
  totalRow.getCell(10).font = { bold: true, size: 11, color: { argb: `FF${BRAND}` } };
  totalRow.eachCell((cell) => {
    cell.border = { top: { style: "medium", color: { argb: `FF${INK_900}` } } };
  });

  if (rows.length === 0) {
    sheet.mergeCells(`A${headerRowIndex + 1}:J${headerRowIndex + 1}`);
    const emptyCell = sheet.getCell(`A${headerRowIndex + 1}`);
    emptyCell.value = "Tidak ada transaksi pada rentang tanggal ini.";
    emptyCell.alignment = { horizontal: "center" };
    emptyCell.font = { italic: true, color: { argb: `FF${INK_400}` } };
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

// =========================================================
// PDF — pakai PDFKit supaya hasilnya dokumen PDF beneran yang
// digenerate di server (rapi & konsisten di device manapun),
// bukan hasil window.print() browser yang tergantung layout halaman.
// =========================================================
export async function generateSalesPdf(rows: SalesReportRow[], summary: SalesReportSummary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 36, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidths = { no: 28, order: 90, tanggal: 62, customer: 120, item: 34, pengiriman: 62, statusOrder: 80, statusBayar: 66 };
    const TOTAL_COL_WIDTH = 90;
    const totalWidth = TOTAL_COL_WIDTH + Object.values(colWidths).reduce((a, b) => a + b, 0);
    colWidths.customer += pageWidth - totalWidth; // sisa lebar dikasih ke kolom customer

    function drawHeader() {
      doc.rect(doc.page.margins.left, doc.page.margins.top, pageWidth, 42).fill(`#${BRAND}`);
      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("FoodMart — Laporan Penjualan", doc.page.margins.left + 14, doc.page.margins.top + 12);

      doc
        .fillColor(`#${INK_400}`)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Periode ${formatDateID(summary.dateFrom)} – ${formatDateID(summary.dateTo)}   •   Digenerate ${new Date().toLocaleString("id-ID")}`,
          doc.page.margins.left,
          doc.page.margins.top + 48
        );
    }

    function drawSummary(y: number) {
      const boxWidth = (pageWidth - 20) / 3;
      const cards = [
        ["Total Revenue (Order Lunas)", formatRupiah(summary.totalRevenue)],
        ["Order Berhasil", `${summary.successOrderCount}`],
        ["Total Order (Semua Status)", `${summary.totalOrderCount}`],
      ];
      cards.forEach(([label, value], i) => {
        const x = doc.page.margins.left + i * (boxWidth + 10);
        doc.roundedRect(x, y, boxWidth, 44, 6).fillAndStroke("#F9FAFB", `#${BORDER}`);
        doc.fillColor(`#${INK_400}`).font("Helvetica").fontSize(8).text(label, x + 10, y + 8, { width: boxWidth - 20 });
        doc.fillColor(`#${INK_900}`).font("Helvetica-Bold").fontSize(13).text(value, x + 10, y + 22, { width: boxWidth - 20 });
      });
      return y + 44 + 18;
    }

    function drawTableHeader(y: number): number {
      const headers = [
        ["No", colWidths.no],
        ["Order Number", colWidths.order],
        ["Tanggal", colWidths.tanggal],
        ["Customer", colWidths.customer],
        ["Item", colWidths.item],
        ["Pengiriman", colWidths.pengiriman],
        ["Status Order", colWidths.statusOrder],
        ["Bayar", colWidths.statusBayar],
        ["Total", TOTAL_COL_WIDTH],
      ] as const;
      doc.rect(doc.page.margins.left, y, pageWidth, 22).fill(`#${INK_900}`);
      let x = doc.page.margins.left;
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#FFFFFF");
      for (const [label, width] of headers) {
        doc.text(label, x + 6, y + 7, { width: width - 8 });
        x += width;
      }
      return y + 22;
    }

    function drawRow(row: SalesReportRow, index: number, y: number): number {
      const rowHeight = 20;
      if (index % 2 === 1) {
        doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fill("#F9FAFB");
      }
      let x = doc.page.margins.left;
      doc.font("Helvetica").fontSize(8.5).fillColor(`#${INK_700}`);
      const cells: [string, number][] = [
        [`${index + 1}`, colWidths.no],
        [row.orderNumber, colWidths.order],
        [formatDateID(row.createdAt), colWidths.tanggal],
        [row.customerName, colWidths.customer],
        [`${row.itemCount}`, colWidths.item],
        [DELIVERY_LABEL[row.deliveryMethod] ?? row.deliveryMethod, colWidths.pengiriman],
        [STATUS_LABEL[row.status] ?? row.status, colWidths.statusOrder],
        [PAYMENT_LABEL[row.paymentStatus] ?? row.paymentStatus, colWidths.statusBayar],
      ];
      for (const [text, width] of cells) {
        doc.text(text, x + 6, y + 6, { width: width - 8, ellipsis: true });
        x += width;
      }
      doc
        .font("Helvetica-Bold")
        .fillColor(`#${INK_900}`)
        .text(formatRupiah(row.totalAmount), x + 6, y + 6, { width: TOTAL_COL_WIDTH - 12, align: "right" });
      doc
        .moveTo(doc.page.margins.left, y + rowHeight)
        .lineTo(doc.page.margins.left + pageWidth, y + rowHeight)
        .strokeColor(`#${BORDER}`)
        .lineWidth(0.5)
        .stroke();
      return y + rowHeight;
    }

    function drawFooter(pageNum: number, pageCount: number) {
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(`#${INK_400}`)
        .text(
          `Halaman ${pageNum} dari ${pageCount} — Digenerate otomatis oleh FoodMart Admin Panel`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom + 10,
          { width: pageWidth, align: "center" }
        );
    }

    drawHeader();
    let y = drawSummary(doc.page.margins.top + 70);
    y = drawTableHeader(y);

    if (rows.length === 0) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(`#${INK_400}`)
        .text("Tidak ada transaksi pada rentang tanggal ini.", doc.page.margins.left, y + 16, {
          width: pageWidth,
          align: "center",
        });
    } else {
      const bottomLimit = doc.page.height - doc.page.margins.bottom - 20;
      rows.forEach((row, i) => {
        if (y + 20 > bottomLimit) {
          doc.addPage();
          drawHeader();
          y = drawTableHeader(doc.page.margins.top + 70);
        }
        y = drawRow(row, i, y);
      });

      // Baris total
      doc.rect(doc.page.margins.left, y, pageWidth, 24).fill(`#${INK_900}`);
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#FFFFFF")
        .text("TOTAL KESELURUHAN", doc.page.margins.left + 10, y + 7)
        .text(
          formatRupiah(rows.reduce((s, r2) => s + r2.totalAmount, 0)),
          doc.page.margins.left + pageWidth - 100,
          y + 7,
          { width: TOTAL_COL_WIDTH, align: "right" }
        );
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawFooter(i - range.start + 1, range.count);
    }

    doc.end();
  });
}
