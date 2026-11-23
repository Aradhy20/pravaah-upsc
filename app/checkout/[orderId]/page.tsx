"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, BookOpen, LayoutDashboard, Lock } from "lucide-react";

interface CheckoutPageProps {
  params: {
    orderId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { orderId } = params;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 mb-6">
          <Lock className="h-7 w-7" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Checkout Temporarily Unavailable
        </h1>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Online payments are temporarily unavailable while our secure payment system is being configured. Please check back soon.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-left text-xs space-y-1.5 text-slate-500">
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Order Reference:</span>
            <span className="font-mono text-slate-700">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Payment Engine:</span>
            <span className="font-medium text-amber-700">Cashfree (In Configuration)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Status:</span>
            <span className="font-semibold text-slate-600">Checkout Paused</span>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <Link
            href="/pyqs"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <BookOpen className="h-4 w-4" />
            <span>Continue Free PYQ Practice</span>
          </Link>

          <Link
            href="/pricing"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Pricing Catalogue</span>
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-slate-400">
          All free Aspirant Foundation capabilities remain completely active. No charges or mock transactions will be incurred.
        </p>
      </div>
    </div>
  );
}
