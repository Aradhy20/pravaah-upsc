"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Tag, Save, CheckCircle, Edit3, DollarSign, Layers } from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/plans");
      const json = await res.json();
      if (json.success) {
        setPlans(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    try {
      const res = await fetch("/api/v1/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: editingPlan.id,
          name: editingPlan.name,
          tagline: editingPlan.tagline,
          isPopular: editingPlan.isPopular,
          isActive: editingPlan.isActive,
          prices: editingPlan.prices,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setEditingPlan(null);
        }, 1200);
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
          </a>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-blue-700" />
            Subscription Plans & Pricing Administration
          </h1>
          <p className="text-xs text-slate-500">
            Configure authoritative server-side plan prices, billing cycles, and feature tier assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/subscriptions"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            View Subscribers & Transactions
          </a>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading plan configs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 bg-white shadow-sm flex flex-col justify-between ${
                p.isPopular ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{p.name}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      Code: {p.code}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {p.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">{p.tagline}</p>

                {/* Subscribers count */}
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Subscribers: {p._count?.subscriptions || 0}</span>
                </div>

                {/* Prices list */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Configured Billing Cycles:
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    {p.prices.map((pr: any) => (
                      <div key={pr.billingInterval} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <span className="block text-[10px] font-bold uppercase text-slate-500">
                          {pr.billingInterval}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{pr.amountRupees}
                        </span>
                        {pr.discountPercent > 0 && (
                          <span className="block text-[9px] font-bold text-emerald-700">
                            -{pr.discountPercent}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-end">
                <button
                  onClick={() => setEditingPlan(JSON.parse(JSON.stringify(p)))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Pricing & Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Edit Plan Configuration: {editingPlan.name}
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingPlan.tagline || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPlan.isPopular}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  Mark as Recommended (Popular)
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPlan.isActive}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  Active for Sale
                </label>
              </div>

              {/* Price Fields */}
              <div className="border-t border-slate-200 pt-3">
                <span className="block font-bold text-slate-700 mb-2">Adjust Prices (INR):</span>
                <div className="grid grid-cols-3 gap-3">
                  {editingPlan.prices.map((pr: any, idx: number) => (
                    <div key={pr.billingInterval}>
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        {pr.billingInterval}
                      </label>
                      <input
                        type="number"
                        value={pr.amountRupees}
                        onChange={(e) => {
                          const updatedPrices = [...editingPlan.prices];
                          updatedPrices[idx].amountRupees = parseFloat(e.target.value) || 0;
                          setEditingPlan({ ...editingPlan, prices: updatedPrices });
                        }}
                        className="w-full rounded-lg border border-slate-300 p-1.5 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
