"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Lock,
} from "lucide-react";

interface CheckoutPageProps {
  params: {
    orderId: string;
  };
}

export default function UpiCheckoutPage({ params }: CheckoutPageProps) {
  const { orderId } = params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins default

  // Load and poll order status
  const fetchStatus = async (manual = false) => {
    if (manual) setVerifying(true);
    try {
      const res = await fetch(`/api/v1/payments/orders/${orderId}/status`);
      const json = await res.json();

      if (res.ok && json.success) {
        setOrder(json.data);
        if (json.data.status === "PAID") {
          // Terminal state reached
          return;
        }
      } else {
        if (!order) {
          setError(json.error?.message || "Order not found");
        }
      }
    } catch (e: any) {
      if (!order) setError("Failed to connect to payment server");
    } finally {
      setLoading(false);
      if (manual) setVerifying(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Poll every 3 seconds while in PENDING or PROCESSING
    const interval = setInterval(() => {
      if (!order || order.status === "PENDING" || order.status === "PROCESSING") {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (!order?.expiresAt) return;
    const expiry = new Date(order.expiresAt).getTime();

    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeftSeconds(diff);
      if (diff <= 0 && order.status === "PENDING") {
        setOrder((prev: any) => ({ ...prev, status: "EXPIRED" }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.expiresAt]);

  const handleCopyIntent = () => {
    if (order?.upiIntent) {
      navigator.clipboard.writeText(order.upiIntent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RotateCw className="h-8 w-8 animate-spin text-blue-700" />
          <p className="text-sm font-semibold text-slate-600">Generating secure UPI order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Checkout Error</h2>
          <p className="mt-2 text-xs text-slate-600">{error || "Unable to locate order reference."}</p>
          <a
            href="/pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Pricing
          </a>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  if (order.status === "PAID") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> Payment Confirmed via UPI
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Subscription Unlocked!
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Your payment of <span className="font-extrabold text-slate-900">₹{order.amount}</span> was verified. Your access to <span className="font-extrabold text-blue-700">{order.productId || "Premium Features"}</span> is active immediately.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Reference:</span>
              <span className="font-mono font-bold text-slate-800">{order.orderId}</span>
            </div>
            {order.utr && (
              <div className="flex justify-between">
                <span className="text-slate-500">Bank UTR / Reference:</span>
                <span className="font-mono font-bold text-slate-800">{order.utr}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold text-slate-800">Unified Payments Interface (UPI)</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 transition"
            >
              Go to Learning Analytics
            </a>
            <a
              href="/pyqs"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Start PYQ Practice
            </a>
          </div>
        </div>
      </div>
    );
  }

  // EXPIRED STATE
  if (order.status === "EXPIRED") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-lg">
          <Clock className="mx-auto h-12 w-12 text-amber-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Payment Window Expired</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            The 15-minute UPI payment QR code has expired to safeguard against delayed bank debits. No funds were captured.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-block w-full rounded-xl bg-blue-700 px-5 py-3 text-xs font-bold text-white hover:bg-blue-800 transition"
          >
            Create Fresh Order
          </a>
        </div>
      </div>
    );
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    order.upiIntent || `upi://pay?pa=merchant@upi&am=${order.amount}&tr=${order.orderId}`
  )}&size=240x240&margin=10`;

  return (
    <div className="min-h-[85vh] bg-slate-50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel & Return
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800">
            <ShieldCheck className="h-3.5 w-3.5" /> 256-bit Encrypted Checkout
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT: QR Code & UPI Apps (3 cols) */}
          <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Payment Method
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Scan UPI QR Code</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            </div>

            {/* QR Code Frame */}
            <div className="mx-auto w-64 h-64 rounded-2xl border-2 border-dashed border-slate-300 p-2 bg-white flex items-center justify-center relative shadow-sm">
              <img
                src={qrImageUrl}
                alt="Scan UPI QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <p className="mt-4 text-xs font-medium text-slate-500">
              Scan with <span className="font-bold text-slate-800">Google Pay, PhonePe, Paytm, CRED</span> or any BHIM UPI App
            </p>

            {/* Mobile UPI Deep Links */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-3">
                Paying from your mobile device?
              </span>

              {order.upiIntent ? (
                <a
                  href={order.upiIntent}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 transition"
                >
                  <Smartphone className="h-4 w-4" /> Open Installed UPI App
                </a>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-slate-100 px-5 py-3 text-xs font-bold text-slate-400"
                >
                  UPI Intent Unavailable
                </button>
              )}

              {/* Copy UPI string */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyIntent}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "UPI Payload Copied!" : "Copy UPI Link"}
                </button>

                {order.paymentUrl && (
                  <a
                    href={order.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Hosted Checkout
                  </a>
                )}
              </div>
            </div>

            {/* Manual Verification Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={verifying}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin text-blue-600" : ""}`} />
                {verifying ? "Checking Settlement with Bank..." : "I Have Paid / Check Status"}
              </button>
            </div>
          </div>

          {/* RIGHT: Order Summary (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Product</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {order.productId || "UPSC Preparation Suite"}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {order.orderId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Base Price</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Math.round((order.amount / 1.18) * 100) / 100}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Math.round((order.amount - order.amount / 1.18) * 100) / 100}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <span className="font-black text-blue-700 text-base">₹{order.amount}</span>
                </div>
              </div>

              {order.isTest && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
                  <span className="font-bold">Sandbox Environment:</span> Use test credentials or simulator to verify without real fund transfers.
                </div>
              )}
            </div>

            {/* Security Guarantee Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-600 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Lock className="h-4 w-4 text-emerald-600" /> NPCI / UPI Direct Settlement
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Payments are processed directly via your UPI application. Pravaah UPSC never sees or stores your UPI PIN or banking credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
