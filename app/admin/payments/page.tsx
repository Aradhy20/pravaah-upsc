"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  RotateCw,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Lock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Radio,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

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

  const handleSyncCashfree = async (orderId: string) => {
    setSyncingOrderId(orderId);
    setSyncNotification(null);
    try {
      const res = await fetch("/api/v1/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "SYNC_CASHFREE",
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSyncNotification({
          text: json.message || "Order successfully synced with Cashfree.",
          type: json.status === "PAID" ? "success" : "info",
        });
        await fetchPayments();
      } else {
        setSyncNotification({
          text: json.error || "Failed to sync order with Cashfree.",
          type: "error",
        });
      }
    } catch (err: any) {
      setSyncNotification({
        text: err.message || "Network error while syncing with Cashfree.",
        type: "error",
      });
    } finally {
      setSyncingOrderId(null);
    }
  };

  const telemetry = data?.telemetry || {
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    totalOrdersCount: 0,
    successfulCount: 0,
    pendingCount: 0,
    expiredCount: 0,
    failedCount: 0,
    underReviewCount: 0,
  };

  const orders = data?.orders || [];
  const webhookLogs = data?.webhookLogs || [];
  const gatewayState = data?.paymentGatewayState;
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Console</span>
          </Link>
          <div className="flex items-center gap-2">
            {gatewayState?.checkoutEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
                <span>Cashfree Active ({gatewayState.environment})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                <Lock className="h-3.5 w-3.5" />
                <span>Cashfree Config Dormant (Checkout Paused)</span>
              </span>
            )}
          </div>
        </div>

        {/* Sync Toast / Banner */}
        {syncNotification && (
          <div
            className={`rounded-2xl p-4 text-xs font-medium flex items-center justify-between transition-all ${
              syncNotification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : syncNotification.type === "error"
                ? "bg-rose-50 text-rose-900 border border-rose-200"
                : "bg-blue-50 text-blue-900 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {syncNotification.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
              {syncNotification.type === "error" && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
              {syncNotification.type === "info" && <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />}
              <span>{syncNotification.text}</span>
            </div>
            <button
              onClick={() => setSyncNotification(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span>Cashfree Payment Gateway & Transaction Ledger</span>
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Official Cashfree v2023-08-01 integration, audited transaction records, automated reconciliation, and webhook telemetry.
              </p>
            </div>
            <button
              onClick={() => fetchPayments()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {/* Gateway Status Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gateway Provider</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">CASHFREE PG</span>
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {gatewayState?.status === "LIVE_PRODUCTION"
                  ? "Live Production Gateway"
                  : gatewayState?.status === "SANDBOX_ACTIVE"
                  ? "Sandbox Testing Gateway"
                  : "Needs API Credentials"}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                API Version: <span className="font-mono font-medium">{gatewayState?.apiVersion || "2023-08-01"}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Webhook Endpoint</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">HMAC-SHA256</span>
              </div>
              <div className="mt-2 text-xs font-mono font-medium text-slate-800 truncate" title={`${gatewayState?.appUrl || "https://pravaah-upsc.vercel.app"}/api/webhooks/cashfree`}>
                /api/webhooks/cashfree
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Timestamp tolerance: 300s replay guard
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Architecture</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-xs font-medium text-slate-800">
                Server-side verification only. Direct manual paid status override is strictly prohibited.
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Zero client price manipulation
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Historical Gross Volume</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              ₹{Number(telemetry.totalRevenue).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total verified transactions</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Verified Paid Orders</span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-blue-600">
              {telemetry.successfulCount}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Out of {telemetry.totalOrdersCount} total orders</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Pending / Dropped</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600">
              {telemetry.pendingCount}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Awaiting or incomplete</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Expired Orders</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-500">
              {telemetry.expiredCount}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Window lapsed</p>
          </div>
        </div>

        {/* Transactions Table & Filters */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Orders Ledger & Cashfree Reconciliation</h2>
              <p className="text-xs text-slate-500">Showing {pagination.total} recorded orders across all gateway sessions</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Order ID, Cashfree ID, email..."
                  className="rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </form>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order Identification</th>
                  <th className="py-3 px-4">Aspirant</th>
                  <th className="py-3 px-4">Plan / Product</th>
                  <th className="py-3 px-4">Amount & Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No order records found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  orders.map((o: any) => {
                    const isSyncing = syncingOrderId === o.id || syncingOrderId === o.clientOrderId;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-semibold text-slate-900">{o.clientOrderId}</div>
                          {o.cashfreeOrderId && (
                            <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                              CF: {o.cashfreeOrderId}
                            </div>
                          )}
                          {o.cashfreePaymentId && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              PID: {o.cashfreePaymentId}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{o.user?.fullName || "Aspirant"}</div>
                          <div className="text-[11px] text-slate-400">{o.user?.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {o.productId || o.productType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            ₹{Number(o.amount).toLocaleString("en-IN")}
                          </div>
                          {o.paymentMethod && (
                            <span className="inline-block mt-0.5 rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 uppercase">
                              {o.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              o.status === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : o.status === "EXPIRED"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div>
                            {new Date(o.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          {o.paidAt && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Paid: {new Date(o.paidAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleSyncCashfree(o.clientOrderId || o.id)}
                            disabled={isSyncing}
                            title="Verify and synchronize payment status directly with Cashfree servers"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition shadow-xs disabled:opacity-50"
                          >
                            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
                            <span>{isSyncing ? "Syncing..." : "Sync CF"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div>
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Webhook Delivery & Event Audit Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Cashfree Webhook Delivery Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-500">
                Incoming signed event telemetry from Cashfree with HMAC-SHA256 signature verification and replay prevention.
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400">
              Endpoint: /api/webhooks/cashfree
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Webhook Event ID</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {webhookLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No webhook notifications recorded yet. Incoming events will be logged here in real-time.
                    </td>
                  </tr>
                ) : (
                  webhookLogs.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-medium text-slate-900">
                        {w.eventId}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                          {w.eventType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {w.orderId || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            w.status === "PROCESSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : w.status === "IGNORED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(w.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
