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
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

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

  const handleSyncStatus = async (orderId: string) => {
    setSyncingOrderId(orderId);
    try {
      const res = await fetch(`/api/v1/payments/orders/${orderId}/status`);
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchPayments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingOrderId(null);
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
            <CreditCard className="h-7 w-7 text-blue-700" />
            UPI Gateway Financial Operations & Ledger
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time transaction tracking, bank UTR verification, and revenue telemetry for Pravaah UPSC
          </p>
        </div>

        <button
          onClick={() => fetchPayments()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Telemetry Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Gross Revenue
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{Number(telemetry.totalRevenue).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            {telemetry.successfulCount} Settled Transactions
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Today's Settlement
          </span>
          <p className="text-2xl font-black text-blue-700 mt-1">
            ₹{Number(telemetry.todayRevenue).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            This Month: ₹{Number(telemetry.monthRevenue).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Authorizations
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {telemetry.pendingCount}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">
            Awaiting Aspirant UPI App Confirmation
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Expired & Under Review
          </span>
          <p className="text-2xl font-black text-slate-700 mt-1">
            {telemetry.expiredCount + telemetry.underReviewCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            {telemetry.underReviewCount} Under Bank Audit • {telemetry.expiredCount} Expired
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["ALL", "PAID", "PENDING", "EXPIRED", "UNDER_REVIEW", "FAILED"].map((tab) => {
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
                    ? "bg-blue-700 text-white shadow-sm"
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
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
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
                <th className="py-3.5 px-4">Order References & UTR</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RotateCw className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
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
                        {o.gatewayOrderId && (
                          <div className="text-slate-400 text-[10px]">GW: {o.gatewayOrderId}</div>
                        )}
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
                        {o.status === "PENDING" || o.status === "UNDER_REVIEW" ? (
                          <button
                            type="button"
                            onClick={() => handleSyncStatus(o.clientOrderId)}
                            disabled={syncingOrderId === o.clientOrderId}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 transition disabled:opacity-50"
                          >
                            <RotateCw
                              className={`h-3 w-3 ${
                                syncingOrderId === o.clientOrderId ? "animate-spin" : ""
                              }`}
                            />
                            <span>Sync</span>
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
