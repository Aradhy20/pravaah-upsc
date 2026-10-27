"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, DollarSign, Calendar, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/subscriptions");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const subscriptions = data?.subscriptions || [];
  const recentPayments = data?.recentPayments || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
          </a>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-700" />
            Subscriber & Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time subscriber entitlements, webhook processing verification, and payment audit logs
          </p>
        </div>

        <a
          href="/admin/plans"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          Manage Plan Prices
        </a>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading subscription records...</div>
      ) : (
        <div className="space-y-8">
          {/* Active Subscriptions Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                User Subscriptions ({subscriptions.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Cycle</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Current Period End</th>
                    <th className="py-3 px-4">Auto-Renew</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {subscriptions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{sub.user.fullName}</div>
                        <div className="text-[11px] text-slate-400">{sub.user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-700">{sub.plan.name}</span>
                        <span className="ml-1 text-[10px] text-slate-400">(Tier {sub.plan.tier})</span>
                      </td>
                      <td className="py-3 px-4 font-semibold uppercase text-[11px]">
                        {sub.billingInterval}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.status === "PAST_DUE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {sub.cancelAtPeriodEnd ? (
                          <span className="text-[11px] font-semibold text-amber-600">
                            Cancels at end
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4">
              <h2 className="text-sm font-bold text-slate-900">
                Payment Records & Gateway Transactions ({recentPayments.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tx Reference</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Gateway Provider</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentPayments.map((pm: any) => (
                    <tr key={pm.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-800">
                        {pm.providerTxId || pm.id}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {pm.user.fullName} ({pm.user.email})
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{pm.amount} {pm.currency}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            pm.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : pm.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pm.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 uppercase text-[10px]">
                        {pm.provider}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(pm.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
