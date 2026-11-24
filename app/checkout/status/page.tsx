"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  BookOpen,
  LayoutDashboard,
  HelpCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [statusData, setStatusData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyOrder = async () => {
    if (!orderId) {
      setError("No order identifier provided in callback URL.");
      setLoading(false);
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      // Call verification endpoint to confirm with Cashfree server API
      const res = await fetch(`/api/v1/payments/orders/${encodeURIComponent(orderId)}/verify`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        // Fetch full order data for receipt rendering
        const statusRes = await fetch(`/api/v1/payments/orders/${encodeURIComponent(orderId)}/status`);
        const statusJson = await statusRes.json();
        if (statusRes.ok && statusJson.success) {
          setStatusData(statusJson.data);
        } else {
          setStatusData({
            orderId,
            status: json.status || "PAID",
            subscriptionId: json.subscriptionId,
          });
        }
      } else {
        // If verify endpoint returned error or non-PAID, fetch status to get latest state
        const statusRes = await fetch(`/api/v1/payments/orders/${encodeURIComponent(orderId)}/status`);
        const statusJson = await statusRes.json();
        if (statusRes.ok && statusJson.success) {
          setStatusData(statusJson.data);
        } else {
          setError(json.error?.message || "Failed to verify transaction status.");
        }
      }
    } catch (e: any) {
      console.error("Verification error:", e);
      setError("Network error while connecting to Cashfree verification service.");
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  useEffect(() => {
    verifyOrder();
  }, [orderId]);

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <RotateCw className="h-10 w-10 text-heritage-burgundy animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-serif font-bold text-heritage-text">
          Verifying Payment with Cashfree
        </h2>
        <p className="mt-2 text-xs text-heritage-secondary max-w-sm mx-auto">
          Securely validating your transaction receipt against the Cashfree server ledger...
        </p>
      </div>
    );
  }

  if (error && !statusData) {
    return (
      <div className="py-8 text-center">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-heritage-text">
          Unable to Verify Transaction
        </h2>
        <p className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 max-w-md mx-auto">
          {error}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => verifyOrder()}
            className="px-5 py-2.5 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition flex items-center gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry Verification</span>
          </button>
          <Link
            href="/dashboard/billing"
            className="px-5 py-2.5 rounded-xl border border-heritage-border text-heritage-text text-xs font-bold hover:bg-heritage-cream transition"
          >
            Go to Billing Ledger
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = statusData?.status === "PAID";
  const isPending = statusData?.status === "PENDING" || statusData?.status === "UNDER_REVIEW";

  if (isPaid) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="h-8 w-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Payment Verified via Cashfree PG</span>
          </span>
          <h2 className="mt-3 text-2xl font-serif font-bold text-heritage-text">
            Welcome to Pravaah Premium!
          </h2>
          <p className="mt-1 text-xs text-heritage-secondary">
            Your subscription is now active. All premium AI study features, comprehensive PYQ analytics, and Mains evaluation rubrics have been unlocked.
          </p>
        </div>

        {/* Verified Receipt Card */}
        <div className="rounded-2xl border border-heritage-gold/30 bg-heritage-cream/40 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-heritage-border">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-heritage-burgundy" />
              <span className="font-bold text-heritage-text">Payment Receipt</span>
            </div>
            <span className="text-[11px] font-mono text-heritage-secondary">
              Ref: {statusData?.clientOrderId || orderId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[11px] text-heritage-secondary block">Plan Activated</span>
              <span className="font-bold text-heritage-text">
                {statusData?.plan?.name || statusData?.productId || "Pravaah Achiever"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-heritage-secondary block">Amount Paid</span>
              <span className="font-bold text-emerald-700 text-sm">
                ₹{Number(statusData?.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {statusData?.cashfreePaymentId && (
            <div className="flex justify-between text-[11px] text-heritage-secondary pt-1 border-t border-heritage-border/50">
              <span>Cashfree Payment ID:</span>
              <span className="font-mono text-heritage-text">{statusData.cashfreePaymentId}</span>
            </div>
          )}

          {statusData?.paymentMethod && (
            <div className="flex justify-between text-[11px] text-heritage-secondary">
              <span>Payment Mode:</span>
              <span className="font-semibold uppercase text-heritage-text">{statusData.paymentMethod}</span>
            </div>
          )}

          {statusData?.paidAt && (
            <div className="flex justify-between text-[11px] text-heritage-secondary">
              <span>Date & Time:</span>
              <span>{new Date(statusData.paidAt).toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Go to Mission Control</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handlePrintReceipt}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-heritage-border bg-white text-heritage-text text-xs font-bold hover:bg-heritage-cream transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4 text-heritage-burgundy" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-heritage-text">
          Payment Processing
        </h2>
        <p className="text-xs text-heritage-secondary max-w-sm mx-auto">
          We have received your order request and are awaiting final settlement notification from your bank via Cashfree.
        </p>

        <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-left text-xs max-w-sm mx-auto space-y-1.5">
          <div className="flex justify-between text-amber-900">
            <span className="text-amber-700">Order ID:</span>
            <span className="font-mono font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between text-amber-900">
            <span className="text-amber-700">Status:</span>
            <span className="font-bold uppercase text-amber-800">Pending Settlement</span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => verifyOrder()}
            disabled={verifying}
            className="px-5 py-2.5 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition flex items-center gap-2"
          >
            <RotateCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin" : ""}`} />
            <span>{verifying ? "Checking..." : "Re-check Status"}</span>
          </button>
          <Link
            href="/dashboard/billing"
            className="px-5 py-2.5 rounded-xl border border-heritage-border text-heritage-text text-xs font-bold hover:bg-heritage-cream transition"
          >
            View Billing History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-serif font-bold text-heritage-text">
        Payment Incomplete or Cancelled
      </h2>
      <p className="mt-1 text-xs text-heritage-secondary max-w-sm mx-auto">
        {statusData?.status === "CANCELLED"
          ? "The checkout session was closed before payment completion."
          : "The transaction was declined by the issuing bank or payment provider."}
        {" "}No money was charged to your account.
      </p>

      <div className="mt-6 rounded-2xl bg-heritage-cream/40 border border-heritage-gold/30 p-4 text-left text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-heritage-secondary">Order Reference:</span>
          <span className="font-mono text-heritage-text">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-heritage-secondary">Status:</span>
          <span className="font-bold text-rose-700 uppercase">
            {statusData?.status || "FAILED"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/pricing"
          className="px-5 py-2.5 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition"
        >
          Retry with Another Payment Method
        </Link>
        <Link
          href="/pyqs"
          className="px-5 py-2.5 rounded-xl border border-heritage-border text-heritage-text text-xs font-bold hover:bg-heritage-cream transition"
        >
          Continue Free Practice
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-heritage-border p-6 sm:p-10 shadow-card">
          <Suspense
            fallback={
              <div className="py-16 text-center">
                <RotateCw className="h-10 w-10 text-heritage-burgundy animate-spin mx-auto mb-4" />
                <h2 className="text-lg font-serif font-bold text-heritage-text">
                  Loading Transaction Status...
                </h2>
              </div>
            }
          >
            <StatusContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
