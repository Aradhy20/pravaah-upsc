"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  Search,
  CheckCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileText,
  Compass,
  ArrowRight,
  Globe,
  MapPin,
  TrendingUp,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";

// ==========================================
// HIGH YIELD CHEAT SHEET DATA (CURATED UPSC VAULT)
// ==========================================

const ARTICLES_DATA = [
  { article: "Article 1", title: "Name and territory of the Union", category: "Union & Territory", significance: "India, that is Bharat, shall be a Union of States." },
  { article: "Article 14", title: "Equality before law", category: "Fundamental Rights", significance: "State shall not deny to any person equality before law or equal protection of laws." },
  { article: "Article 19", title: "Protection of six freedoms", category: "Fundamental Rights", significance: "Speech & expression, assembly, association, movement, residence, and profession (subject to reasonable restrictions)." },
  { article: "Article 21", title: "Protection of life and personal liberty", category: "Fundamental Rights", significance: "Due process of law, right to privacy (Puttaswamy), right to clean environment, livelihood." },
  { article: "Article 21A", title: "Right to Education", category: "Fundamental Rights", significance: "Free and compulsory education to all children aged 6 to 14 years (86th Amendment 2002)." },
  { article: "Article 32", title: "Remedies for enforcement of Fundamental Rights", category: "Fundamental Rights", significance: "Heart and soul of Constitution (Dr. Ambedkar). Power to issue writs: Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, Certiorari." },
  { article: "Article 39(b) & (c)", title: "Socialistic DPSP (Resource distribution)", category: "DPSP", significance: "Distribution of material resources to subserve common good; preventing concentration of wealth." },
  { article: "Article 40", title: "Organization of Village Panchayats", category: "DPSP", significance: "Empowers village panchayats with necessary powers as units of self-government (fulfilled by 73rd Amendment)." },
  { article: "Article 44", title: "Uniform Civil Code", category: "DPSP", significance: "State shall endeavor to secure for citizens a Uniform Civil Code throughout the territory of India." },
  { article: "Article 51A", title: "Fundamental Duties", category: "Fundamental Duties", significance: "11 duties added by 42nd Amendment 1976 (Swaran Singh Committee) + 86th Amendment 2002." },
  { article: "Article 72", title: "President's Pardoning Power", category: "Union Executive", significance: "Pardon, commute, remit, suspend, or reprieve sentences in Court Martial, Union laws, and death sentences." },
  { article: "Article 110", title: "Definition of Money Bills", category: "Parliament", significance: "Certified by Speaker of Lok Sabha; Rajya Sabha has only 14 days advisory window." },
  { article: "Article 123", title: "President's power to promulgate Ordinances", category: "Union Executive", significance: "When either House is not in session; must be approved within 6 weeks of reassembly." },
  { article: "Article 143", title: "Advisory Jurisdiction of Supreme Court", category: "Judiciary", significance: "President may refer questions of law or fact of public importance for SC opinion." },
  { article: "Article 279A", title: "Goods and Services Tax (GST) Council", category: "Constitutional Bodies", significance: "Joint forum of Centre & States (101st Amendment); 3/4th majority required for decisions." },
  { article: "Article 280", title: "Finance Commission", category: "Constitutional Bodies", significance: "Constituted every 5 years by President for horizontal and vertical tax devolution." },
  { article: "Article 324", title: "Election Commission of India", category: "Constitutional Bodies", significance: "Superintendence, direction, and control of elections to Parliament, State Legislatures, President & VP." },
  { article: "Article 352, 356, 360", title: "Emergency Provisions", category: "Emergency", significance: "National Emergency (352: War, external aggression, armed rebellion), President's Rule (356), Financial Emergency (360)." },
];

const AMENDMENTS_DATA = [
  { amendment: "42nd Amendment (1976)", name: "Mini-Constitution", details: "Added 'Socialist, Secular, Integrity' to Preamble; added Fundamental Duties (Part IVA); added Article 39A, 43A, 48A; curtailed judicial review (later restored)." },
  { amendment: "44th Amendment (1978)", name: "Restoration of Democratic Safeguards", details: "Removed Right to Property from Fundamental Rights (made legal right Art 300A); replaced 'internal disturbance' with 'armed rebellion' in Art 352; safeguarded Articles 20 and 21 during Emergency." },
  { amendment: "52nd Amendment (1985)", name: "Anti-Defection Law", details: "Added 10th Schedule to disqualify MPs/MLAs defecting from political parties. Presiding officer decides disqualification (Kihoto Hollohan case made it subject to judicial review)." },
  { amendment: "73rd & 74th Amendments (1992)", name: "Panchayati Raj & Municipalities", details: "Constitutionalized local self-government. Added Part IX (11th Schedule, 29 subjects) and Part IXA (12th Schedule, 18 subjects). Mandated 33% reservation for women and State Finance Commissions." },
  { amendment: "86th Amendment (2002)", name: "Right to Free & Compulsory Education", details: "Inserted Article 21A making elementary education a fundamental right for ages 6-14; modified Article 45 (early childhood care); added 11th Fundamental Duty (Art 51A(k))." },
  { amendment: "101st Amendment (2016)", name: "Goods and Services Tax (GST)", details: "Subsumed multiple central and state indirect taxes; inserted Article 246A (simultaneous taxation powers), Article 269A (IGST), and Article 279A (GST Council)." },
  { amendment: "103rd Amendment (2019)", name: "10% EWS Reservation", details: "Permitted up to 10% reservation for Economically Weaker Sections in educational institutions and public employment by amending Articles 15(6) and 16(6) (upheld in Janhit Abhiyan v. UOI)." },
  { amendment: "106th Amendment (2023)", name: "Nari Shakti Vandan Adhiniyam", details: "Reserves 33% of seats for women in Lok Sabha, State Legislative Assemblies, and Delhi Assembly for a period of 15 years, effective after subsequent census and delimitation." },
];

const ENVIRONMENT_HOTSPOTS = [
  { name: "Jim Corbett National Park", state: "Uttarakhand", river: "Ramganga River", significance: "India's first National Park (1936 as Hailey NP). Project Tiger launched here in 1973. Sub-Himalayan belt ecosystem." },
  { name: "Kaziranga National Park", state: "Assam", river: "Brahmaputra, Diphlu River", significance: "UNESCO World Heritage Site. Home to two-thirds of world's Great One-horned Rhinoceroses, Royal Bengal Tigers, Elephants, Wild Water Buffalo." },
  { name: "Sundarbans National Park", state: "West Bengal", river: "Ganga, Brahmaputra, Meghna Delta", significance: "World's largest contiguous mangrove forest. Biosphere Reserve & Ramsar Site. Unique Royal Bengal Tigers adapted to swimming in tidal waters." },
  { name: "Keoladeo Ghana National Park", state: "Rajasthan", river: "Confluence of Gambhir & Banganga", significance: "Ramsar Site & Montreux Record site. Man-made wetland vital wintering ground for migratory birds (Siberian Crane historically)." },
  { name: "Bandipur & Nagarhole", state: "Karnataka", river: "Kabini River", significance: "Part of Nilgiri Biosphere Reserve (India's 1st Biosphere Reserve, 1986). Crucial elephant corridor connecting Western and Eastern Ghats." },
  { name: "Dihing Patkai National Park", state: "Assam", river: "Dihing River", significance: "Known as the 'Amazon of the East'. Tropical lowland rainforest with rare White-winged Wood Duck and Hoolock Gibbon." },
  { name: "Silent Valley National Park", state: "Kerala", river: "Kunthipuzha River", significance: "Core of Nilgiri Biosphere Reserve. Famous for Lion-tailed Macaque and undisturbed tropical evergreen rainforest." },
  { name: "Namdapha National Park", state: "Arunachal Pradesh", river: "Noa-Dihing River", significance: "Only park in the world with 4 feline species: Tiger, Leopard, Snow Leopard, and Clouded Leopard. Eastern Himalaya biodiversity hotspot." },
];

const RIVERS_DATA = [
  { river: "Indus System", origin: "Bokhar Chu Glacier (Tibet / Mansarovar)", leftTributaries: "Zanskar, Jhelum, Chenab, Ravi, Beas, Sutlej (Panjnad)", rightTributaries: "Shyok, Gilgit, Hunza, Swat, Kabul, Kurram, Gomal", keyFacts: "Indus Waters Treaty 1960 allocates eastern rivers (Ravi, Beas, Sutlej) to India and western rivers (Indus, Jhelum, Chenab) to Pakistan." },
  { river: "Ganga System", origin: "Gangotri Glacier (Bhagirathi) -> Devprayag confluence with Alaknanda", leftTributaries: "Ramganga, Gomti (originates from Gomat Taal lake), Ghaghara, Gandak, Kosi ('Sorrow of Bihar'), Mahananda", rightTributaries: "Yamuna (largest tributary, confluences at Prayagraj), Son, Punpun, Damodar ('Sorrow of Bengal')", keyFacts: "National River of India. National Waterway 1 (Prayagraj to Haldia, 1620 km). Clean Ganga Mission (Namami Gange)." },
  { river: "Brahmaputra System", origin: "Chemayungdung Glacier (Tibet as Yarlung Tsangpo)", leftTributaries: "Lohit, Dibang, Burhi Dihing, Dhansiri", rightTributaries: "Subansiri (gold river), Kameng, Manas, Sankosh, Teesta", keyFacts: "Enters India through Namcha Barwa gorge as Siang/Dihang. Majuli is world's largest river island. NW-2 (Dhubri to Sadiya)." },
  { river: "Godavari (Dakshin Ganga)", origin: "Trimbakeshwar (Nashik, Maharashtra)", leftTributaries: "Penganga, Wainganga, Wardha (unite to form Pranhita), Indravati, Sabari", rightTributaries: "Manjra (major right bank tributary), Pravara, Sindphana", keyFacts: "Longest river of Peninsular India (1465 km). Discharges into Bay of Bengal near Rajahmundry. Polavaram Dam project." },
  { river: "Krishna System", origin: "Mahabaleshwar (Western Ghats, Maharashtra)", leftTributaries: "Bhima (longest tributary), Musi (Hyderabad located on its banks), Munneru", rightTributaries: "Koyna, Ghataprabha, Malaprabha, Tungabhadra (formed by Tunga & Bhadra)", keyFacts: "Second largest east-flowing peninsular river. Disputed water allocation (KWDT). Major dams: Almatti, Srisailam, Nagarjuna Sagar." },
  { river: "Cauvery (Kaveri)", origin: "Talakaveri (Brahmagiri Range, Karnataka)", leftTributaries: "Harangi, Hemavati, Shimsha, Arkavathi", rightTributaries: "Lakshmana Tirtha, Kabini, Suvarnavathi, Bhavani, Noyyal, Amaravathi", keyFacts: "Flows through Karnataka & Tamil Nadu. Receives rainfall from both SW and NE monsoons (perennial flow). Grand Anicut (Kallanai built by Karikala Chola)." },
  { river: "Narmada", origin: "Amarkantak Plateau (Madhya Pradesh)", leftTributaries: "Sher, Shakkar, Dudhi, Tawa, Ganjal", rightTributaries: "Hiran, Orsang, Barna", keyFacts: "Flows westward through a rift valley between Vindhya and Satpura ranges. Dhuandhar Falls (Marble Rocks, Jabalpur). Sardar Sarovar Dam." },
];

const STANDARD_BOOKLIST = [
  {
    subject: "Indian Polity & Governance",
    books: [
      { title: "Indian Polity (7th Edition)", author: "M. Laxmikanth", priority: "Must Read", chapters: "Parts I to VIII: Constitutional Framework, Systems of Govt, Central & State Govt, Judiciary, Local Bodies, Constitutional Bodies." },
      { title: "Introduction to the Constitution of India", author: "Dr. D.D. Basu", priority: "Reference", chapters: "Analytical commentary on constitutional law, judicial review & federal balance." },
      { title: "NCERT Class 11", author: "Indian Constitution at Work", priority: "Foundation", chapters: "All 10 chapters on Rights, Election, Executive, Legislature, Judiciary, Federalism & Local Govt." },
    ],
  },
  {
    subject: "Modern Indian History",
    books: [
      { title: "A Brief History of Modern India", author: "Rajiv Ahir (Spectrum)", priority: "Must Read", chapters: "From British Conquest, Socio-Religious Reforms, 1857 Revolt to National Freedom Movement & Post-1947 Consolidation." },
      { title: "India's Struggle for Independence", author: "Bipan Chandra", priority: "Conceptual", chapters: "In-depth understanding of Gandhian mass movements, ideological streams (Left, Revolutionary, Subhas Bose)." },
      { title: "NCERT Class 12", author: "Themes in Indian History - Part III", priority: "Foundation", chapters: "Colonialism and Countryside, Rebels and the Raj, Mahatma Gandhi and the Nationalist Movement." },
    ],
  },
  {
    subject: "Indian Economy",
    books: [
      { title: "Indian Economy", author: "Ramesh Singh / Vivek Singh / Sanjiv Verma", priority: "Must Read", chapters: "Macroeconomic fundamentals, Money & Banking, Fiscal Policy, External Sector, Agriculture, Infrastructure, Poverty." },
      { title: "Economic Survey & Union Budget (Current Year)", author: "Ministry of Finance", priority: "Annual High-Yield", chapters: "State of the Economy, Prices & Inflation, Monetary Management, Climate Finance, External Sector trends." },
      { title: "NCERT Class 11 & 12", author: "Indian Economic Development & Macroeconomics", priority: "Foundation", chapters: "National Income Accounting, Money and Banking, Government Budget, Post-1991 Economic Reforms." },
    ],
  },
  {
    subject: "Geography (Physical & Indian)",
    books: [
      { title: "Certificate Physical and Human Geography", author: "G.C. Leong", priority: "Must Read", chapters: "Part 1: The Earth's Crust, Vulcanism, Earthquakes, Weathering, Landforms. Part 2: World Climatic Types." },
      { title: "NCERT Class 11", author: "Fundamentals of Physical Geography", priority: "Crucial", chapters: "Geomorphology, Climatology (Monsoon, Cyclones), Oceanography (Currents, Relief, Salinity)." },
      { title: "NCERT Class 11", author: "India: Physical Environment", priority: "Crucial", chapters: "Physiography, Drainage Systems of India, Climate, Soils, Natural Vegetation." },
    ],
  },
  {
    subject: "Environment & Ecology",
    books: [
      { title: "Environment (PMF IAS / Shankar IAS)", author: "PMF IAS / Shankar IAS Academy", priority: "Must Read", chapters: "Ecology principles, Terrestrial & Aquatic Biomes, Biodiversity conservation, Climate Change, International Conventions." },
      { title: "State of Forest Report (ISFR) & MoEFCC Reports", author: "Forest Survey of India", priority: "Factual High-Yield", chapters: "Forest cover statistics, mangrove area, carbon stock, tiger census estimates." },
      { title: "NCERT Biology Class 12 (Units 10)", author: "Ecology Chapters 13 to 16", priority: "Foundation", chapters: "Organisms and Populations, Ecosystem, Biodiversity and Conservation, Environmental Issues." },
    ],
  },
  {
    subject: "Ethics, Integrity & Aptitude (Mains GS4)",
    books: [
      { title: "Lexicon for Ethics, Integrity & Aptitude", author: "Chronicle Editorial", priority: "Must Read", chapters: "Dimensions of Ethics, Emotional Intelligence, Thinkers, Civil Service Values, Probity, Citizen's Charter." },
      { title: "2nd Administrative Reforms Commission (ARC)", author: "4th Report: Ethics in Governance", priority: "Must Quote", chapters: "Code of Ethics vs Code of Conduct, Anti-Corruption mechanisms, Whistleblower protection, Lokpal." },
    ],
  },
];

export default function SyllabusVaultPage() {
  const [activeTab, setActiveTab] = useState<"SYLLABUS" | "BOOKLIST" | "CHEAT_SHEETS" | "ROADMAP">("SYLLABUS");
  const [syllabusFilter, setSyllabusFilter] = useState<string>("ALL");
  const [cheatSheetCategory, setCheatSheetCategory] = useState<"ARTICLES" | "AMENDMENTS" | "ENVIRONMENT" | "RIVERS">("ARTICLES");
  const [searchQuery, setSearchQuery] = useState("");
  const [syllabusNodes, setSyllabusNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSyllabus() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/syllabus");
        const json = await res.json();
        if (json.success && json.data.nodes) {
          setSyllabusNodes(json.data.nodes);
        }
      } catch (e) {
        console.error("Failed to load syllabus nodes:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSyllabus();
  }, []);

  const filteredNodes = syllabusNodes.filter((node) => {
    const matchesPaper = syllabusFilter === "ALL" || node.paperCode === syllabusFilter;
    const matchesSearch =
      searchQuery === "" ||
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPaper && matchesSearch;
  });

  const filteredArticles = ARTICLES_DATA.filter(
    (a) =>
      a.article.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.significance.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAmendments = AMENDMENTS_DATA.filter(
    (a) =>
      a.amendment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnvironment = ENVIRONMENT_HOTSPOTS.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.significance.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRivers = RIVERS_DATA.filter(
    (r) =>
      r.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.leftTributaries.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rightTributaries.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-heritage-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-heritage-cream border border-heritage-gold/40 px-4 py-1.5 text-xs font-bold text-heritage-burgundy mb-4 shadow-xs">
            <Sparkles className="h-4 w-4 text-heritage-gold" />
            Official UPSC Crack Engine & High-Yield Vault
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-text tracking-tight">
            Everything You Need to <span className="text-heritage-burgundy">Crack UPSC CSE</span>
          </h1>
          <p className="mt-3 text-base text-heritage-secondary leading-relaxed">
            Authoritative micro-topic syllabus, standard NCERT & booklist mapping, high-yield static cheat sheets, and 365-day preparation strategy compiled from verified UPSC official standards.
          </p>
        </div>

        {/* Primary Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 border-b border-heritage-border pb-4">
          <button
            onClick={() => { setActiveTab("SYLLABUS"); setSearchQuery(""); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "SYLLABUS"
                ? "bg-heritage-burgundy text-white shadow-xs font-extrabold"
                : "bg-white text-heritage-text hover:bg-heritage-cream border border-heritage-border"
            }`}
          >
            <Layers className="h-4 w-4 text-heritage-gold" />
            Detailed Syllabus Matrix
          </button>

          <button
            onClick={() => { setActiveTab("BOOKLIST"); setSearchQuery(""); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "BOOKLIST"
                ? "bg-heritage-burgundy text-white shadow-xs font-extrabold"
                : "bg-white text-heritage-text hover:bg-heritage-cream border border-heritage-border"
            }`}
          >
            <BookOpen className="h-4 w-4 text-heritage-gold" />
            Standard Booklist & Roadmap
          </button>

          <button
            onClick={() => { setActiveTab("CHEAT_SHEETS"); setSearchQuery(""); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "CHEAT_SHEETS"
                ? "bg-heritage-burgundy text-white shadow-xs font-extrabold"
                : "bg-white text-heritage-text hover:bg-heritage-cream border border-heritage-border"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-heritage-gold" />
            High-Yield Concept Vaults
          </button>

          <button
            onClick={() => { setActiveTab("ROADMAP"); setSearchQuery(""); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "ROADMAP"
                ? "bg-heritage-burgundy text-white shadow-xs font-extrabold"
                : "bg-white text-heritage-text hover:bg-heritage-cream border border-heritage-border"
            }`}
          >
            <Calendar className="h-4 w-4 text-heritage-gold" />
            365-Day Master Strategy
          </button>
        </div>

        {/* Global Live Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-heritage-secondary" />
          <input
            type="text"
            placeholder={
              activeTab === "SYLLABUS"
                ? "Search syllabus by topic (e.g. Fundamental Rights, Inflation, Monsoon)..."
                : activeTab === "CHEAT_SHEETS"
                ? "Search articles, amendments, rivers, national parks (e.g. Article 21, 42nd Amendment, Brahmaputra)..."
                : "Search subjects, topics, or standard books..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-heritage-border bg-white py-3 pl-12 pr-4 text-sm font-medium text-heritage-text shadow-card focus:border-heritage-gold focus:outline-none focus:ring-2 focus:ring-heritage-gold/20"
          />
        </div>

        {/* TAB 1: DETAILED SYLLABUS MATRIX */}
        {activeTab === "SYLLABUS" && (
          <div>
            {/* Paper Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { code: "ALL", label: "All Papers" },
                { code: "GS1", label: "Prelims GS Paper 1" },
                { code: "CSAT", label: "Prelims Paper 2 (CSAT)" },
                { code: "MAINS-GS1", label: "Mains GS 1" },
                { code: "MAINS-GS2", label: "Mains GS 2" },
                { code: "MAINS-GS3", label: "Mains GS 3" },
                { code: "MAINS-GS4", label: "Mains GS 4 (Ethics)" },
                { code: "ESSAY", label: "Essay Paper" },
              ].map((pill) => (
                <button
                  key={pill.code}
                  onClick={() => setSyllabusFilter(pill.code)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    syllabusFilter === pill.code
                      ? "bg-heritage-burgundy text-white shadow-xs"
                      : "bg-white text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center text-heritage-secondary">Loading syllabus nodes from database...</div>
            ) : filteredNodes.length === 0 ? (
              <div className="rounded-2xl border border-heritage-border bg-white p-12 text-center text-heritage-secondary shadow-card">
                No syllabus topics matching "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNodes.map((node) => (
                  <div
                    key={node.code}
                    className="flex flex-col justify-between rounded-2xl border border-heritage-border bg-white p-6 shadow-card hover:shadow-hover transition-shadow group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-block rounded-md bg-heritage-cream px-2.5 py-1 text-[11px] font-extrabold text-heritage-burgundy border border-heritage-border">
                          {node.code}
                        </span>
                        <span className="text-xs font-semibold text-heritage-secondary">
                          {node.paperCode}
                        </span>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-heritage-secondary mb-1">
                        {node.subjectName}
                      </div>
                      <h3 className="font-serif text-base font-bold text-heritage-text group-hover:text-heritage-burgundy transition-colors">
                        {node.title}
                      </h3>
                      <p className="mt-2 text-xs text-heritage-secondary leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-heritage-border/60 flex items-center justify-between">
                      <Link
                        href={`/pyqs?search=${encodeURIComponent(node.title.split(" ")[0])}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-heritage-burgundy hover:text-heritage-wine"
                      >
                        Practice Related PYQs <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STANDARD BOOKLIST & ROADMAP */}
        {activeTab === "BOOKLIST" && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine p-6 text-white shadow-gold border border-heritage-gold/30">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <BookOpen className="h-6 w-6 text-heritage-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold">The Standard UPSC Resource Compendium</h2>
                  <p className="mt-1 text-sm text-heritage-cream/90 leading-relaxed">
                    Topper recommendation: <strong>"Read one book ten times, rather than ten books one time."</strong> Below is the exhaustive subject-by-subject mapping to officially tested NCERTs and standard reference books.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STANDARD_BOOKLIST.map((subj, idx) => (
                <div key={idx} className="rounded-2xl border border-heritage-border bg-white p-6 shadow-card">
                  <h3 className="font-serif text-lg font-bold text-heritage-text mb-4 pb-2 border-b border-heritage-border/60 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-heritage-cream text-xs font-bold text-heritage-burgundy border border-heritage-border">
                      {idx + 1}
                    </span>
                    {subj.subject}
                  </h3>

                  <div className="space-y-4">
                    {subj.books.map((b, bIdx) => (
                      <div key={bIdx} className="rounded-xl bg-heritage-ivory p-4 border border-heritage-border">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif text-sm font-bold text-heritage-text">{b.title}</h4>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                              b.priority === "Must Read"
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : b.priority === "Crucial"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-heritage-cream text-heritage-burgundy border-heritage-border"
                            }`}
                          >
                            {b.priority}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-heritage-secondary mt-0.5">Author / Source: {b.author}</div>
                        <p className="mt-2 text-xs text-heritage-text leading-relaxed">
                          <strong>Key Chapters:</strong> {b.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HIGH-YIELD STATIC CONCEPT CHEAT SHEETS */}
        {activeTab === "CHEAT_SHEETS" && (
          <div>
            {/* Sub-Category Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { id: "ARTICLES", label: "Constitutional Articles" },
                { id: "AMENDMENTS", label: "Key Amendments" },
                { id: "ENVIRONMENT", label: "National Parks & Ramsar Sites" },
                { id: "RIVERS", label: "Rivers & Tributaries" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCheatSheetCategory(cat.id as any)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    cheatSheetCategory === cat.id
                      ? "bg-heritage-burgundy text-white shadow-xs"
                      : "bg-white text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sub-Tab 3A: Constitutional Articles */}
            {cheatSheetCategory === "ARTICLES" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((art, idx) => (
                  <div key={idx} className="rounded-2xl border border-heritage-border bg-white p-5 shadow-card hover:shadow-hover transition">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-serif text-sm font-bold text-heritage-burgundy">{art.article}</span>
                      <span className="text-[10px] font-bold rounded-md bg-heritage-cream px-2 py-0.5 text-heritage-burgundy border border-heritage-border">
                        {art.category}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-heritage-text mb-2">{art.title}</h4>
                    <p className="text-xs text-heritage-secondary leading-relaxed">{art.significance}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Tab 3B: Amendments */}
            {cheatSheetCategory === "AMENDMENTS" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAmendments.map((amd, idx) => (
                  <div key={idx} className="rounded-2xl border border-heritage-border bg-white p-6 shadow-card">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-serif text-base font-bold text-heritage-burgundy">{amd.amendment}</h4>
                      <span className="text-xs font-bold text-heritage-secondary">{amd.name}</span>
                    </div>
                    <p className="text-xs text-heritage-text leading-relaxed mt-2">{amd.details}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Tab 3C: Environment Hotspots */}
            {cheatSheetCategory === "ENVIRONMENT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnvironment.map((env, idx) => (
                  <div key={idx} className="rounded-2xl border border-heritage-border bg-white p-5 shadow-card">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {env.state}
                      </span>
                      <span className="text-[11px] font-semibold text-heritage-secondary flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-heritage-gold" /> {env.river}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-heritage-text mb-2">{env.name}</h4>
                    <p className="text-xs text-heritage-secondary leading-relaxed">{env.significance}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Tab 3D: Rivers & Tributaries */}
            {cheatSheetCategory === "RIVERS" && (
              <div className="space-y-6">
                {filteredRivers.map((riv, idx) => (
                  <div key={idx} className="rounded-2xl border border-heritage-border bg-white p-6 shadow-card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-heritage-border/60">
                      <h3 className="font-serif text-lg font-bold text-heritage-burgundy">{riv.river}</h3>
                      <span className="text-xs font-semibold text-heritage-secondary">
                        <strong>Origin:</strong> {riv.origin}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                      <div className="rounded-xl bg-heritage-ivory p-3.5 border border-heritage-border">
                        <span className="font-serif font-bold text-heritage-text block mb-1">Left-Bank Tributaries:</span>
                        <span className="text-heritage-secondary">{riv.leftTributaries}</span>
                      </div>
                      <div className="rounded-xl bg-heritage-ivory p-3.5 border border-heritage-border">
                        <span className="font-serif font-bold text-heritage-text block mb-1">Right-Bank Tributaries:</span>
                        <span className="text-heritage-secondary">{riv.rightTributaries}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-heritage-text leading-relaxed bg-heritage-cream/80 p-3.5 rounded-xl border border-heritage-gold/30">
                      <strong>High-Yield Fact:</strong> {riv.keyFacts}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 365-DAY UPSC MASTER STRATEGY */}
        {activeTab === "ROADMAP" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white border border-heritage-border p-8 shadow-card">
              <h2 className="font-serif text-2xl font-bold text-heritage-text mb-6 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-heritage-gold" />
                The 4-Phase 365-Day UPSC Preparation Blueprint
              </h2>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-heritage-border">
                {/* Phase 1 */}
                <div className="relative flex items-start gap-6 pl-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-heritage-burgundy text-white font-bold text-sm shadow">
                    1
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-heritage-burgundy">
                      Months 1 to 4 • Foundation & Basic NCERTs
                    </span>
                    <h3 className="font-serif text-lg font-bold text-heritage-text mt-1">
                      Concept Mastery & Habit Formation
                    </h3>
                    <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
                      Read foundational NCERTs (Class 6 to 12) for History, Geography, Polity, and Economy. Develop a daily habit of reading one standard national daily (The Hindu or Indian Express) and attempt the 5-Question Daily Prelims Diagnostic on Pravaah.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">NCERT Class 11/12</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Daily 5-MCQ Quiz</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">PIB Current Affairs</span>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative flex items-start gap-6 pl-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-heritage-wine text-white font-bold text-sm shadow">
                    2
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-heritage-wine">
                      Months 5 to 8 • Core Standard Reference Books & Optional
                    </span>
                    <h3 className="font-serif text-lg font-bold text-heritage-text mt-1">
                      Standard References & Integrated Mains Preparation
                    </h3>
                    <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
                      Complete first thorough reading of Laxmikanth, Spectrum, Economy (Ramesh Singh/Vivek Singh), and PMF IAS Environment. Complete 70% of Optional Subject syllabus. Start writing 1 Mains answer daily in the Mains Answer Studio.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Laxmikanth & Spectrum</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Mains 1 Question / Day</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Optional Subject Pass 1</span>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative flex items-start gap-6 pl-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-heritage-saffron text-white font-bold text-sm shadow">
                    3
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-heritage-saffron">
                      Months 9 to 11 • Prelims Intensive & PYQ Drill
                    </span>
                    <h3 className="font-serif text-lg font-bold text-heritage-text mt-1">
                      Verified Question Deep Dive, CSAT & Mock Testing
                    </h3>
                    <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
                      Shift 100% focus to Prelims. Solve all verified official questions from 1995-2024 on Pravaah UPSC. Memorize elimination techniques. Take 2-Hour timed mock exams every weekend. Regularly review mistake notebook to clear weak spots.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Official PYQ Explorer</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Timed 2-Hour Mocks</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">CSAT Practice</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Mistake Revision</span>
                    </div>
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="relative flex items-start gap-6 pl-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm shadow">
                    4
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Post-Prelims (June to September) • Mains Acceleration
                    </span>
                    <h3 className="font-serif text-lg font-bold text-heritage-text mt-1">
                      Ethics Case Studies, Essay & Full-Length Tests
                    </h3>
                    <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
                      Write 2 full essays per week using the PESTLE multidimensional framework. Solve 50+ Ethics case studies. Revise value-added data points, committee recommendations, and Supreme Court judgments.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Ethics Case Studies</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Essay Frameworks</span>
                      <span className="rounded-md bg-heritage-ivory border border-heritage-border px-2 py-1 text-xs font-medium text-heritage-text">Full 3-Hour Simulation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA to Subscription / Test Series */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-gold border border-heritage-gold/30">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Ready to Put Strategy into Practice?</h2>
            <p className="mt-3 text-heritage-cream/90 text-sm sm:text-base leading-relaxed">
              Solve verified UPSC CSE questions with official UPSC answer keys, statement-by-statement evidence, and automated SuperMemo-2 mistake revision.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pyqs"
                className="rounded-xl bg-heritage-cream text-heritage-burgundy px-6 py-3 text-sm font-bold hover:bg-white transition shadow-xs"
              >
                Start Practicing PYQs
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-xs border border-white/20"
              >
                View Premium Plans & Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
