"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowLeft,
  RotateCw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

declare global {
  interface Window {
    Cashfree: any;
  }
}

interface CheckoutPageProps {
  params: {
    orderId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const { orderId } = params;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/v1/payments/orders/${orderId}/status`);
        const json = await res.json();
        if (res.ok && json.success) {
          setOrder(json.data);
          // If already paid, redirect directly to status
          if (json.data.status === "PAID") {
            router.push(`/checkout/status?order_id=${encodeURIComponent(orderId)}`);
          }
        } else {
          setError(json.error?.message || "Unable to retrieve order details.");
        }
      } catch (e: any) {
        console.error("Order fetch error:", e);
        setError("Network error while connecting to payment ledger.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const handlePayNow = () => {
    if (!order?.paymentSessionId) {
      setError("Payment session is missing for this order. Please create a new checkout session.");
      return;
    }

    if (!window.Cashfree) {
      setError("Payment checkout engine is initializing. Please wait a moment and try again.");
      return;
    }

    try {
      setInitiating(true);
      const isProd =
        process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "production" ||
        process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PROD";

      const cashfree = window.Cashfree({
        mode: isProd ? "production" : "sandbox",
      });

      cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      console.error("Cashfree checkout error:", err);
      setError(err.message || "Failed to open Cashfree checkout gateway.");
      setInitiating(false);
    }
  };

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-heritage-border p-6 sm:p-10 shadow-card">
          {/* Back link */}
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-heritage-secondary hover:text-heritage-burgundy transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Pricing Catalogue</span>
          </Link>

          {loading ? (
            <div className="py-16 text-center">
              <RotateCw className="h-8 w-8 text-heritage-burgundy animate-spin mx-auto mb-3" />
              <p className="font-serif font-bold text-heritage-text text-sm">
                Retrieving Verified Checkout Session...
              </p>
              <p className="text-xs text-heritage-secondary mt-1">Connecting to Cashfree Payments Engine</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-heritage-saffron mx-auto mb-4" />
              <h2 className="font-serif text-xl font-bold text-heritage-text">
                Checkout Unavailable
              </h2>
              <p className="text-xs sm:text-sm text-heritage-secondary mt-2 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition shadow-xs"
                >
                  Return to Pricing
                </Link>
                <Link
                  href="/pyqs"
                  className="px-5 py-2.5 rounded-xl border border-heritage-border text-heritage-text text-xs font-bold hover:bg-heritage-cream transition"
                >
                  Continue Free Practice
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="border-b border-heritage-border/60 pb-6 mb-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-heritage-cream px-3 py-1 text-[11px] font-bold text-heritage-burgundy border border-heritage-gold/30 mb-3">
                  <Lock className="h-3.5 w-3.5 text-heritage-gold" />
                  <span>256-Bit SSL Encrypted Checkout · Cashfree Hosted</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-text">
                  Complete Your Subscription
                </h1>
                <p className="text-xs text-heritage-secondary mt-1">
                  Order Reference: <span className="font-mono font-bold text-heritage-text">{order.orderId}</span>
                </p>
              </div>

              {/* Order Details Card */}
              <div className="rounded-2xl bg-heritage-cream/40 border border-heritage-gold/30 p-5 space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-heritage-text text-sm">
                    {order.planName || "Aspirant Pro Subscription"}
                  </span>
                  <span className="font-bold text-heritage-burgundy bg-heritage-cream px-2.5 py-0.5 rounded-md border border-heritage-gold/30">
                    {order.billingInterval}
                  </span>
                </div>

                <div className="flex justify-between items-center text-heritage-secondary">
                  <span>Product Classification:</span>
                  <span className="font-medium text-heritage-text">UPSC CSE Preparation SaaS</span>
                </div>

                <div className="flex justify-between items-center text-heritage-secondary">
                  <span>Payment Gateway:</span>
                  <span className="font-semibold text-emerald-800">Cashfree Payments (Official)</span>
                </div>

                <div className="border-t border-heritage-border/60 pt-3.5 flex justify-between items-baseline">
                  <span className="font-serif font-bold text-heritage-text text-base">Total Payable Amount:</span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-black text-heritage-burgundy">
                      ₹{order.amount}
                    </span>
                    <span className="block text-[10px] text-heritage-secondary font-medium">
                      Inclusive of all taxes (GST)
                    </span>
                  </div>
                </div>
              </div>

              {/* Supported Payment Methods Badge */}
              <div className="mt-6 p-4 rounded-xl bg-white border border-heritage-border text-xs text-heritage-secondary space-y-2">
                <span className="font-bold text-heritage-text block">Supported Payment Channels:</span>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-heritage-cream text-heritage-text font-medium">
                    ⚡ UPI (GPay, PhonePe, Paytm, BHIM)
                  </span>
                  <span className="px-2 py-1 rounded bg-heritage-cream text-heritage-text font-medium">
                    💳 Credit & Debit Cards (RuPay, Visa, Mastercard)
                  </span>
                  <span className="px-2 py-1 rounded bg-heritage-cream text-heritage-text font-medium">
                    🏦 Net Banking (50+ Banks)
                  </span>
                  <span className="px-2 py-1 rounded bg-heritage-cream text-heritage-text font-medium">
                    📱 Wallets
                  </span>
                </div>
              </div>

              {/* Guarantee notice */}
              <div className="mt-4 flex items-center gap-2 text-xs text-heritage-secondary">
                <ShieldCheck className="h-4 w-4 text-heritage-gold shrink-0" />
                <span>Backed by our 7-Day Unconditional Money-Back Guarantee.</span>
              </div>

              {/* CTA Button */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handlePayNow}
                  disabled={initiating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-heritage-burgundy to-heritage-wine hover:from-heritage-wine hover:to-heritage-burgundy text-white py-3.5 px-6 font-bold text-sm shadow-gold transition-all disabled:opacity-50"
                >
                  {initiating ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin text-heritage-gold" />
                      <span>Opening Cashfree Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-heritage-gold" />
                      <span>Pay ₹{order.amount} via Cashfree Secure Checkout</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-heritage-secondary">
                  Clicking will open Cashfree's secure hosted payment page. Your payment information is encrypted and never stored on our servers.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
