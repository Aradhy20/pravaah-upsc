"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  MessageSquare,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  HelpCircle,
  FileQuestion,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n/context";

export default function ContactPage() {
  const { language } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("CONTENT_CORRECTION");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<{
    ticketNumber: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    {
      id: "CONTENT_CORRECTION",
      labelEn: "PYQ / Question Bank Correction",
      labelHi: "विगत वर्ष प्रश्न / उत्तर कुंजी सुधार",
      hint: "Report typo, disputed option key, or missing syllabus linkage",
    },
    {
      id: "BILINGUAL",
      labelEn: "Hindi / Translation Feedback",
      labelHi: "हिन्दी माध्यम / अनुवाद सुधार",
      hint: "Suggestions for technical terminology or Hindi phrasing",
    },
    {
      id: "ACCOUNT_LOGIN",
      labelEn: "Account & Login Assistance",
      labelHi: "खाता / लॉगिन सहायता",
      hint: "Password reset, session expiry, or profile sync issues",
    },
    {
      id: "TECHNICAL",
      labelEn: "Technical Bug / Platform Issue",
      labelHi: "तकनीकी बग / प्लेटफॉर्म त्रुटि",
      hint: "UI glitch, timer issue, or exam engine failure",
    },
    {
      id: "BILLING",
      labelEn: "Subscription / Future Access Query",
      labelHi: "सदस्यता / भविष्य की पहुंच सम्बन्धी प्रश्न",
      hint: "Questions regarding upcoming Cashfree subscriptions or plan tiers",
    },
    {
      id: "FEEDBACK",
      labelEn: "Feature Suggestion / General Feedback",
      labelHi: "नई सुविधा का सुझाव / सामान्य सुझाव",
      hint: "Share ideas to help UPSC aspirants prepare better",
    },
    {
      id: "OTHER",
      labelEn: "Other Inquiry",
      labelHi: "अन्य पूछताछ",
      hint: "Direct inquiry for the Pravaah UPSC academic team",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError(language === "hi" ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name (minimum 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(language === "hi" ? "कृपया एक मान्य ईमेल पता दर्ज करें।" : "Please enter a valid email address.");
      return;
    }

    if (subject.trim().length < 5) {
      setError(language === "hi" ? "विषय कम से कम 5 अक्षरों का होना चाहिए।" : "Subject must be at least 5 characters.");
      return;
    }

    if (message.trim().length < 20) {
      setError(language === "hi" ? "कृपया संदेश कम से कम 20 अक्षरों में लिखें।" : "Please provide at least 20 characters in your message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          category,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessTicket({
          ticketNumber: data.ticketNumber,
          message: data.message,
        });
        setFullName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Failed to submit support ticket. Please try again.");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setError("Network connection issue. You may reach us directly via WhatsApp or phone.");
    } finally {
      setLoading(false);
    }
  };

  const copyTicketNumber = () => {
    if (successTicket?.ticketNumber) {
      navigator.clipboard.writeText(successTicket.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden border border-heritage-gold/30">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-gold/20 text-heritage-goldLight text-xs font-semibold mb-4 border border-heritage-gold/30">
              <Headphones className="h-3.5 w-3.5 text-heritage-gold" />
              {language === "hi" ? "आधिकारिक यूपीएससी सहायता एवं संपर्क" : "Official UPSC Aspirant Support Desk"}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight text-white">
              {language === "hi" ? (
                <>प्रवाह यूपीएससी से <span className="text-heritage-gold">सीधा संपर्क करें</span></>
              ) : (
                <>Contact <span className="text-heritage-gold">Pravaah UPSC</span></>
              )}
            </h1>
            <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed">
              {language === "hi"
                ? "हमारी समर्पित शैक्षणिक और तकनीकी सहायता टीम सिविल सेवा अभ्यर्थियों की हर समस्या के समाधान के लिए तत्पर है। प्रश्न-बैंक सुधार, अनुवाद समीक्षा या तकनीकी सहायता हेतु नीचे दिए गए आधिकारिक माध्यमों का प्रयोग करें।"
                : "Direct academic and technical assistance for Civil Services aspirants. Connect directly with our engineering and UPSC research team for question-bank queries, Hindi translation feedback, or platform support."}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <Headphones className="w-96 h-96 text-heritage-gold" />
          </div>
        </div>

        {/* 3 Direct Support Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 1. Phone Card */}
          <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-xs hover:border-heritage-gold transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heritage-cream text-heritage-burgundy mb-4 border border-heritage-border">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-heritage-dark">
                {language === "hi" ? "टेलीफोन सहायता" : "Telephone Support"}
              </h3>
              <p className="text-xs text-heritage-muted mt-1 mb-4 leading-relaxed">
                {language === "hi"
                  ? "तत्काल शैक्षणिक सहायता या तकनीकी रुकावट के लिए सीधे कॉल करें।"
                  : "Speak directly with our technical lead for urgent platform inquiries."}
              </p>
              <div className="p-3 bg-heritage-ivory rounded-xl border border-heritage-border font-mono text-sm font-bold text-heritage-dark mb-4">
                +91 7351522153
              </div>
            </div>
            <a
              href="tel:+917351522153"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition shadow-xs"
            >
              <Phone className="h-4 w-4" />
              {language === "hi" ? "कॉल करें (+91 7351522153)" : "Call +91 7351522153"}
            </a>
          </div>

          {/* 2. WhatsApp Card */}
          <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-xs hover:border-heritage-gold transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 mb-4 border border-emerald-200">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-heritage-dark">
                {language === "hi" ? "व्हाट्सएप हेल्पडेस्क" : "WhatsApp Helpdesk"}
              </h3>
              <p className="text-xs text-heritage-muted mt-1 mb-4 leading-relaxed">
                {language === "hi"
                  ? "प्रश्न का स्क्रीनशॉट या त्रुटि तुरंत भेजें। तीव्रतम उत्तर समय।"
                  : "Send screenshots of questions, syllabus doubts, or system feedback."}
              </p>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 font-mono text-sm font-bold text-emerald-950 mb-4">
                +91 7351522153
              </div>
            </div>
            <a
              href="https://wa.me/917351522153?text=Hi%20Pravaah%20UPSC%20Support%2C%20I%20am%20an%20aspirant%20and%20need%20assistance%20with%3A"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
            >
              <MessageSquare className="h-4 w-4" />
              {language === "hi" ? "व्हाट्सएप पर चैट करें" : "Chat on WhatsApp"}
            </a>
          </div>

          {/* 3. Email Card */}
          <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-xs hover:border-heritage-gold transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heritage-cream text-heritage-gold mb-4 border border-heritage-border">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-heritage-dark">
                {language === "hi" ? "आधिकारिक ईमेल" : "Official Support Email"}
              </h3>
              <p className="text-xs text-heritage-muted mt-1 mb-4 leading-relaxed">
                {language === "hi"
                  ? "विस्तृत शैक्षणिक समीक्षा, संस्थागत साझेदारी या मुख्य उत्तर मूल्यांकन जांच।"
                  : "Detailed academic reviews, partnership queries, or data verification."}
              </p>
              <div className="p-3 bg-heritage-ivory rounded-xl border border-heritage-border font-mono text-xs font-bold text-heritage-dark truncate mb-4">
                jainaradhy123@gmail.com
              </div>
            </div>
            <a
              href="mailto:jainaradhy123@gmail.com?subject=Pravaah%20UPSC%20Aspirant%20Support%20Inquiry"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-heritage-wine hover:bg-heritage-burgundy text-white text-xs font-bold transition shadow-xs"
            >
              <Mail className="h-4 w-4" />
              {language === "hi" ? "ईमेल भेजें" : "Send Email"}
            </a>
          </div>
        </div>

        {/* Support SLA Banner */}
        <div className="bg-white rounded-2xl border border-heritage-border p-5 sm:p-6 shadow-xs mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-heritage-cream text-heritage-burgundy border border-heritage-border">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-heritage-dark">
                {language === "hi" ? "प्रतिबद्ध प्रतिक्रिया समय (SLA)" : "Committed Response SLA"}
              </h4>
              <p className="text-xs text-heritage-muted mt-0.5">
                {language === "hi"
                  ? "मानक शैक्षणिक प्रश्न: 2–4 घंटे (सोम-रवि 9:00 AM – 9:00 PM IST) • गंभीर तकनीकी रुकावट: 1 घंटे के भीतर"
                  : "Standard inquiries: 2–4 hours (Mon–Sun 9:00 AM – 9:00 PM IST) • Critical access bugs: within 1 hour."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-heritage-dark bg-heritage-ivory px-3 py-1.5 rounded-xl border border-heritage-border">
            <ShieldCheck className="h-4 w-4 text-heritage-gold" />
            <span>Academic Lead: Aradhy Jain</span>
          </div>
        </div>

        {/* Contact Form & Resolution Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-heritage-border p-6 sm:p-10 shadow-sm">
            <div className="border-b border-heritage-border pb-5 mb-6">
              <h2 className="text-xl font-serif font-black text-heritage-dark">
                {language === "hi" ? "ऑनलाइन सहायता टिकट दर्ज करें" : "Open a Support Ticket"}
              </h2>
              <p className="text-xs text-heritage-muted mt-1">
                {language === "hi"
                  ? "आपके द्वारा दर्ज किया गया प्रत्येक टिकट हमारे डेटाबेस में सुरक्षित होता है और एक विशिष्ट ट्रैकिंग नंबर प्रदान करता है।"
                  : "Every submission creates a unique tracked ticket in our PostgreSQL database for structured academic resolution."}
              </p>
            </div>

            {successTicket ? (
              <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl animate-in fade-in-50">
                <div className="flex items-center gap-3 text-emerald-800 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <h3 className="text-base font-serif font-bold">
                    {language === "hi" ? "टिकट सफलतापूर्वक दर्ज किया गया!" : "Support Ticket Registered!"}
                  </h3>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed mb-4">
                  {successTicket.message}
                </p>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 mb-5">
                  <div>
                    <span className="text-[10px] font-bold text-heritage-muted uppercase tracking-wider block">
                      Ticket Reference Number
                    </span>
                    <span className="font-mono text-base font-black text-heritage-dark">
                      {successTicket.ticketNumber}
                    </span>
                  </div>
                  <button
                    onClick={copyTicketNumber}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-heritage-border text-xs font-semibold text-heritage-dark hover:bg-heritage-cream transition"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setSuccessTicket(null)}
                  className="px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition"
                >
                  {language === "hi" ? "एक और टिकट दर्ज करें" : "Submit Another Inquiry"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-heritage-dark mb-1.5">
                      {language === "hi" ? "पूरा नाम" : "Full Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aradhy Jain"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs text-heritage-dark bg-heritage-ivory/50 focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:border-transparent placeholder:text-heritage-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-heritage-dark mb-1.5">
                      {language === "hi" ? "ईमेल पता" : "Email Address"} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aspirant@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs text-heritage-dark bg-heritage-ivory/50 focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:border-transparent placeholder:text-heritage-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-heritage-dark mb-1.5">
                    {language === "hi" ? "समस्या / पूछताछ की श्रेणी" : "Inquiry Category"} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs text-heritage-dark focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:border-transparent bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === "hi" ? c.labelHi : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-heritage-dark mb-1.5">
                    {language === "hi" ? "विषय" : "Subject"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your query or question reference"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs text-heritage-dark bg-heritage-ivory/50 focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:border-transparent placeholder:text-heritage-muted"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-heritage-dark">
                      {language === "hi" ? "विस्तृत विवरण" : "Detailed Description"} *
                    </label>
                    <span className="text-[11px] text-heritage-muted font-mono">
                      {message.length} / 3000 chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include question numbers, exam year, or specific page URL if applicable..."
                    className="w-full p-3.5 rounded-xl border border-heritage-border text-xs text-heritage-dark bg-heritage-ivory/50 focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:border-transparent placeholder:text-heritage-muted leading-relaxed font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Registering Ticket...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{language === "hi" ? "सहायता टिकट जमा करें" : "Submit Support Ticket"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Explanations & FAQ (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-heritage-border p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-serif font-bold text-heritage-dark mb-4 flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-heritage-gold" />
                Frequently Addressed Queries
              </h3>
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-heritage-ivory rounded-xl border border-heritage-border">
                  <span className="font-serif font-bold text-heritage-dark block mb-1">
                    How do I report a disputed UPSC answer key?
                  </span>
                  <p className="text-heritage-muted leading-relaxed">
                    Select "PYQ / Question Bank Correction" category above with the Year, Paper (GS1/CSAT), and Question number. Pravaah UPSC adheres strictly to UPSC's officially published Series A answer key, with caveats clearly cited.
                  </p>
                </div>

                <div className="p-3 bg-heritage-ivory rounded-xl border border-heritage-border">
                  <span className="font-serif font-bold text-heritage-dark block mb-1">
                    Is paid checkout currently active?
                  </span>
                  <p className="text-heritage-muted leading-relaxed">
                    Paid subscriptions via Cashfree are currently in merchant review. All authentic learning features, PYQs, Daily Quizzes, and Mains frameworks remain 100% accessible to registered aspirants during this transition.
                  </p>
                </div>

                <div className="p-3 bg-heritage-ivory rounded-xl border border-heritage-border">
                  <span className="font-serif font-bold text-heritage-dark block mb-1">
                    Can I switch between Hindi and English mediums?
                  </span>
                  <p className="text-heritage-muted leading-relaxed">
                    Yes. Use the language switcher at the top right of the navigation bar anytime. All question stems, explanations, and frameworks adapt to your selected medium.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-heritage-wine to-heritage-burgundy rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-heritage-gold/30">
              <h3 className="text-base font-serif font-bold mb-2">Direct Founder & Engineering Escalation</h3>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                For academic institutional partnerships, university test series integration, or critical platform integrity reports:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/90">
                  <span className="font-semibold text-heritage-goldLight">Academic Lead:</span> Aradhy Jain
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="font-semibold text-heritage-goldLight">Direct Line:</span> +91 7351522153
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="font-semibold text-heritage-goldLight">Academic Desk:</span> jainaradhy123@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
