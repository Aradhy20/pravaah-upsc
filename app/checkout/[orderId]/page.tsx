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
  Send,
  HelpCircle,
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

  // UTR submission state
  const [utrInput, setUtrInput] = useState("");
  const [utrSubmitting, setUtrSubmitting] = useState(false);
  const [utrMessage, setUtrMessage] = useState<string | null>(null);
  const [utrError, setUtrError] = useState<string | null>(null);

  // Load and poll order status
  const fetchStatus = async (manual = false) => {
    if (manual) setVerifying(true);
    try {
      const res = await fetch(`/api/v1/payments/orders/${orderId}/status`);
      const json = await res.json();

      if (res.ok && json.success) {
        setOrder(json.data);
        if (json.data.status === "PAID") {
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

    // Poll every 3 seconds while in PENDING, PROCESSING, or UNDER_REVIEW
    const interval = setInterval(() => {
      if (!order || order.status === "PENDING" || order.status === "PROCESSING" || order.status === "UNDER_REVIEW") {
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

  const handleCopyIntent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;

    setUtrSubmitting(true);
    setUtrError(null);
    setUtrMessage(null);

    try {
      const res = await fetch(`/api/v1/payments/orders/${orderId}/submit-utr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr: utrInput.trim() }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setUtrMessage(json.message || "UTR submitted successfully!");
        setOrder((prev: any) => ({
          ...prev,
          status: "UNDER_REVIEW",
          utr: utrInput.trim().toUpperCase(),
        }));
        setUtrInput("");
      } else {
        setUtrError(json.error?.message || "Failed to submit UTR. Please check the number.");
      }
    } catch (err: any) {
      setUtrError("Connection error while submitting UTR. Please retry.");
    } finally {
      setUtrSubmitting(false);
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
          <RotateCw className="h-8 w-8 animate-spin text-amber-600" />
          <p className="text-sm font-semibold text-slate-600">Generating dynamic UPI payment request...</p>
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

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 mb-3 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Payment Verified & Settled
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Subscription Unlocked!
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Your payment of <span className="font-extrabold text-slate-900">₹{order.amount}</span> to{" "}
            <span className="font-bold text-slate-900">{order.payeeName || "Aradhy Jain"}</span> was confirmed. Your access to{" "}
            <span className="font-extrabold text-amber-700">{order.productId || "Premium Features"}</span> is active immediately.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Reference:</span>
              <span className="font-mono font-bold text-slate-800">{order.orderId}</span>
            </div>
            {order.utr && (
              <div className="flex justify-between">
                <span className="text-slate-500">Verified UTR / Ref:</span>
                <span className="font-mono font-bold text-emerald-700">{order.utr}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Receiving Account:</span>
              <span className="font-mono font-semibold text-slate-800">{order.receivingUpiId || "jainaradhy123@okicici"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-slate-800">Unified Payments Interface (UPI)</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition"
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
            The 15-minute UPI dynamic QR window has expired to safeguard against delayed bank transactions.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-block w-full rounded-xl bg-amber-600 px-5 py-3 text-xs font-bold text-white hover:bg-amber-700 transition"
          >
            Create Fresh Order
          </a>
        </div>
      </div>
    );
  }

  // Build authoritative dynamic UPI intent URL directed to Aradhy Jain
  const receivingUpiId = order.receivingUpiId || "jainaradhy123@okicici";
  const payeeName = order.payeeName || "Aradhy Jain";
  const formattedAmount = Number(order.amount).toFixed(2);
  const upiPayload =
    order.upiIntent ||
    `upi://pay?pa=${receivingUpiId}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&tr=${order.orderId}&tn=${encodeURIComponent(`Pravaah UPSC ${order.orderId}`)}&cu=INR`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    upiPayload
  )}&size=260x260&margin=10`;

  return (
    <div className="min-h-[85vh] bg-slate-50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel & Return
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Direct UPI Peer-to-Account
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT: Dynamic QR & Payee Details & UTR Submission (3 cols) */}
          <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Payment Destination
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{payeeName}</h3>
                <span className="text-xs font-mono font-medium text-slate-500">{receivingUpiId}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            </div>

            {/* Dynamic QR Code Frame */}
            <div className="mx-auto w-64 h-64 rounded-2xl border-2 border-dashed border-amber-300 p-2 bg-white flex items-center justify-center relative shadow-sm">
              <img
                src={qrImageUrl}
                alt="Dynamic UPI QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <p className="mt-3 text-xs font-medium text-slate-500">
              Scan with <span className="font-bold text-slate-800">Google Pay, PhonePe, Paytm</span> or any UPI App
            </p>

            {/* Payee Info Chip */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-1.5 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-900">Payee:</span> {payeeName} &nbsp;|&nbsp;
              <span className="font-mono text-slate-700">{receivingUpiId}</span>
              <button
                type="button"
                onClick={() => handleCopyIntent(receivingUpiId)}
                className="text-amber-700 hover:text-amber-800 font-bold ml-1"
                title="Copy UPI ID"
              >
                Copy
              </button>
            </div>

            {/* Mobile UPI Deep Link Buttons */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2.5">
                Paying from mobile? Tap your app:
              </span>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <a
                  href={upiPayload}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                >
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" /> Google Pay
                </a>
                <a
                  href={upiPayload}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                >
                  <Smartphone className="h-3.5 w-3.5 text-purple-600" /> PhonePe
                </a>
              </div>

              <a
                href={upiPayload}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition"
              >
                <Zap className="h-4 w-4" /> Open Any UPI App (₹{formattedAmount})
              </a>
            </div>

            {/* STEP 2: UTR SUBMISSION & VERIFICATION WORKFLOW */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Step 2: Enter UPI Reference (UTR)
                </h4>
                {order.status === "UNDER_REVIEW" && (
                  <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    Under Review
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                After completing the payment in your app, enter the 12-digit UTR / UPI Transaction Reference Number below to activate access:
              </p>

              {order.status === "UNDER_REVIEW" ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold text-indigo-900 block">
                        Payment Reference Under Review
                      </span>
                      <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                        We have logged UTR <strong className="font-mono">{order.utr}</strong>. Our team verifies incoming Google Pay / ICICI notifications within 2-5 minutes. This page will update automatically.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUtrSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. 432109876543 (12 digits)"
                      maxLength={24}
                      className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={utrSubmitting || !utrInput.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {utrSubmitting ? "Submitting..." : "Submit UTR"}
                    </button>
                  </div>
                  {utrError && <p className="text-[11px] text-rose-600 font-medium">{utrError}</p>}
                  {utrMessage && <p className="text-[11px] text-emerald-600 font-medium">{utrMessage}</p>}
                </form>
              )}
            </div>

            {/* Check Status Polling Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={verifying}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin text-amber-600" : ""}`} />
                {verifying ? "Checking Settlement with Bank..." : "Refresh Status"}
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
                  <span className="text-slate-500 block">Product / Subscription</span>
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
                  <span className="font-black text-amber-700 text-base">₹{formattedAmount}</span>
                </div>
              </div>

              {order.isTest && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
                  <span className="font-bold">Sandbox Environment:</span> Use simulator or submit test UTR to verify activation flow.
                </div>
              )}
            </div>

            {/* Receiving Payee Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-600 shadow-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Receiving Payee
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p><strong>Account Holder:</strong> {payeeName}</p>
                <p><strong>UPI ID:</strong> <span className="font-mono font-bold text-slate-800">{receivingUpiId}</span></p>
                <p><strong>Bank / App:</strong> ICICI Bank via Google Pay</p>
              </div>
            </div>

            {/* Security Guarantee Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-600 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Lock className="h-4 w-4 text-emerald-600" /> NPCI Direct Settlement
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Funds settle directly into the designated account. Pravaah UPSC never requests or stores your UPI PIN or banking passwords.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
