"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Check,
  X,
  Smartphone,
  Building,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchQuery,
        page: page.toString(),
        limit: "20",
      });

      const res = await fetch(`/api/v1/admin/payments?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        console.error(json.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleVerifyOrder = async (orderId: string, utr?: string) => {
    setProcessingOrderId(orderId);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/v1/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_utr",
          orderId,
          utr,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setActionMessage(json.message || "Order verified and subscription activated!");
        await fetchPayments();
      } else {
        setActionError(json.error || "Failed to verify order.");
      }
    } catch (err: any) {
      setActionError("Error connecting to server.");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to mark order ${orderId} as FAILED?`)) return;

    setProcessingOrderId(orderId);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/v1/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_order",
          orderId,
          reason: "Rejected by admin review: transaction not verified in bank account.",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setActionMessage(json.message || "Order marked as rejected.");
        await fetchPayments();
      } else {
        setActionError(json.error || "Failed to reject order.");
      }
    } catch (err: any) {
      setActionError("Error connecting to server.");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const telemetry = data?.telemetry || {
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    successfulCount: 0,
    pendingCount: 0,
    expiredCount: 0,
    failedCount: 0,
    underReviewCount: 0,
  };

  const receivingAccount = data?.receivingAccount || {
    upiId: "jainaradhy123@okicici",
    payeeName: "Aradhy Jain",
    app: "Google Pay",
    bank: "ICICI Bank",
    status: "ACTIVE",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Console
            </a>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-amber-600" />
            UPI Gateway Financial Operations & Ledger
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time transaction tracking, bank UTR verification, and receiving account telemetry for Pravaah UPSC
          </p>
        </div>

        <button
          onClick={() => fetchPayments()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {actionMessage}
          </span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {actionError && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Receiving Payment Account Status Card */}
      <div className="mb-8 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                Default Receiving Account
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Live & Receiving
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {receivingAccount.payeeName}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                {receivingAccount.upiId}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                {receivingAccount.bank} via {receivingAccount.app}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                Retail UPI VPA • Manual UTR Reconciliation
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-3 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Transactions
            </span>
            <span className="text-lg font-black text-amber-700">
              {telemetry.successfulCount} Settled / {telemetry.underReviewCount} Under Review
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Revenue Collected
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{Number(telemetry.totalRevenue).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            {telemetry.successfulCount} Settled Orders
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Today's Settlement
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            ₹{Number(telemetry.todayRevenue).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            This Month: ₹{Number(telemetry.monthRevenue).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
            Manual Verification Queue
          </span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {telemetry.underReviewCount}
          </p>
          <span className="text-[11px] text-indigo-800 font-semibold mt-1 inline-block">
            UTR Submitted • Awaiting Admin Confirmation
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending / Awaiting Pay
          </span>
          <p className="text-2xl font-black text-slate-700 mt-1">
            {telemetry.pendingCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            {telemetry.expiredCount} Expired
          </span>
        </div>
      </div>

      {/* DEDICATED MANUAL VERIFICATION QUEUE (Shown when orders are under review) */}
      {data?.reviewQueue && data.reviewQueue.length > 0 && (
        <div className="mb-8 rounded-2xl border-2 border-indigo-300 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                Manual UTR Verification Queue (Needs Admin Approval)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students have submitted the following UTR numbers from their UPI payment app. Verify against your Google Pay / ICICI statement and click "Verify & Activate".
              </p>
            </div>
            <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800">
              {data.reviewQueue.length} Pending Actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-indigo-50/70 border-y border-indigo-100 text-indigo-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Submitted UTR Reference</th>
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.reviewQueue.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{item.user?.fullName}</div>
                      <div className="text-[11px] text-slate-400">{item.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {item.productId || item.productType}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ₹{item.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {item.utr || "NO_UTR"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {item.clientOrderId}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {new Date(item.updatedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleVerifyOrder(item.clientOrderId, item.utr)}
                          disabled={processingOrderId === item.clientOrderId}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {processingOrderId === item.clientOrderId ? "Activating..." : "Verify & Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectOrder(item.clientOrderId)}
                          disabled={processingOrderId === item.clientOrderId}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["ALL", "PAID", "UNDER_REVIEW", "PENDING", "EXPIRED", "FAILED"].map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab === "ALL" ? "All Orders" : tab.replace("_", " ")}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, UTR, Order ID..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Product / Plan</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Order ID & UTR</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RotateCw className="mx-auto h-6 w-6 animate-spin text-amber-600 mb-2" />
                    Loading financial transactions...
                  </td>
                </tr>
              ) : !data?.orders || data.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No payment orders match the selected filters.
                  </td>
                </tr>
              ) : (
                data.orders.map((o: any) => {
                  const statusColors: Record<string, string> = {
                    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                    EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
                    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
                    UNDER_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{o.user?.fullName}</div>
                        <div className="text-[11px] text-slate-400">{o.user?.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{o.productId}</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {o.productType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 text-sm">₹{o.amount}</span>
                        <span className="text-[10px] text-slate-400 block">incl. 18% GST</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            statusColors[o.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {o.status === "PAID" && <CheckCircle2 className="h-3 w-3" />}
                          {o.status === "PENDING" && <Clock className="h-3 w-3 animate-pulse" />}
                          {o.status === "EXPIRED" && <XCircle className="h-3 w-3" />}
                          {o.status === "UNDER_REVIEW" && <HelpCircle className="h-3 w-3" />}
                          <span>{o.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-slate-800 font-semibold">{o.clientOrderId}</div>
                        {o.utr && (
                          <div className="text-emerald-700 font-bold text-[10px]">
                            UTR: {o.utr}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {o.status === "UNDER_REVIEW" ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleVerifyOrder(o.clientOrderId, o.utr)}
                              disabled={processingOrderId === o.clientOrderId}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectOrder(o.clientOrderId)}
                              disabled={processingOrderId === o.clientOrderId}
                              className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : o.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyOrder(o.clientOrderId)}
                            disabled={processingOrderId === o.clientOrderId}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Reconciled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total orders)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                type="button"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
