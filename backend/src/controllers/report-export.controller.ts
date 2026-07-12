import { Request, Response, NextFunction } from "express";
import { orderRepository } from "../repositories/order.repository";
import {
  generateSalesExcel,
  generateSalesPdf,
  SalesReportRow,
  SalesReportSummary,
} from "../services/report-export.service";

async function buildReportData(req: Request): Promise<{ rows: SalesReportRow[]; summary: SalesReportSummary }> {
  const dateFrom = (req.query.dateFrom as string) || undefined;
  const dateTo = (req.query.dateTo as string) || undefined;

  // pageSize besar supaya export mengambil SEMUA transaksi di rentang tanggal
  // (bukan cuma 1 halaman kayak tampilan tabel di layar).
  const result = await orderRepository.listForAdmin({ dateFrom, dateTo, pageSize: 10000 });

  const rows: SalesReportRow[] = result.data.map((o) => {
    const user = o.users as unknown as { full_name: string; email: string } | null;
    const payments = o.payments as unknown as { status: string }[] | null;
    return {
      orderNumber: o.order_number,
      createdAt: o.created_at,
      customerName: user?.full_name ?? o.recipient_name,
      customerEmail: user?.email ?? "-",
      itemCount: o.order_items?.length ?? 0,
      deliveryMethod: o.delivery_method,
      status: o.status,
      paymentStatus: payments?.[0]?.status ?? "pending",
      totalAmount: Number(o.total_amount),
    };
  });

  const successRows = rows.filter((r) => r.paymentStatus === "settlement");

  const summary: SalesReportSummary = {
    dateFrom: dateFrom ?? rows[rows.length - 1]?.createdAt ?? new Date().toISOString(),
    dateTo: dateTo ?? new Date().toISOString(),
    totalRevenue: successRows.reduce((s, r) => s + r.totalAmount, 0),
    successOrderCount: successRows.length,
    totalOrderCount: result.total,
  };

  return { rows, summary };
}

export const reportExportController = {
  async excel(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows, summary } = await buildReportData(req);
      const buffer = await generateSalesExcel(rows, summary);
      const filename = `laporan-penjualan-${summary.dateFrom.slice(0, 10)}_${summary.dateTo.slice(0, 10)}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  },

  async pdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows, summary } = await buildReportData(req);
      const buffer = await generateSalesPdf(rows, summary);
      const filename = `laporan-penjualan-${summary.dateFrom.slice(0, 10)}_${summary.dateTo.slice(0, 10)}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  },
};
