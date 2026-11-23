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
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              <Lock className="h-3.5 w-3.5" />
              <span>Cashfree Migration in Progress (Checkout Paused)</span>
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span>Payment & Transaction Ledger (Historical Audit)</span>
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Audited transaction records, subscription lifecycle telemetry, and financial audit logs for Pravaah UPSC.
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

          {/* Migration Status Notice */}
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold">Payment Gateway Clean-Up & Cashfree Architecture</p>
                <p className="mt-0.5 text-amber-800">
                  Legacy personal UPI QR generation and manual UTR verification workflows have been completely decommissioned.
                  Online payments are safely paused until merchant profile approval and official API credentials are provided.
                  All historical payment and subscription data is preserved in this ledger for regulatory and accounting audit.
                </p>
              </div>
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
              <h2 className="text-base font-bold text-slate-900">Historical Orders & Audit Trail</h2>
              <p className="text-xs text-slate-500">Showing {pagination.total} recorded orders across all gateway sessions</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Order ID, user email..."
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
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Paid At</th>
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
                  orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {o.clientOrderId}
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{Number(o.amount).toLocaleString("en-IN")}
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
                        {new Date(o.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {o.paidAt
                          ? new Date(o.paidAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
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
      </div>
    </div>
  );
}
