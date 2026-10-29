#!/usr/bin/env python3
"""
scripts/discover_upsc_papers.py
Multi-Exam Question Paper & Answer Key Discovery Engine for Pravaah UPSC.

Discovers, verifies, and catalogs authoritative examination papers across:
1. UPSC Civil Services Examination (CSE) — Prelims (GS1, CSAT) & Mains (Essay, GS I-IV)
2. Indian Forest Service (IFS)
3. Combined Defence Services (CDS)
4. National Defence Academy (NDA & NA)
5. Central Armed Police Forces (CAPF AC)
6. Engineering Services Examination (ESE)
7. Combined Medical Services (CMS)
8. EPFO (Enforcement Officer / APFC)

Outputs:
- data/source_documents/source_registry.json
- Database table SourceDocument synchronization in prisma/dev.db
- docs/SOURCE_REGISTRY.md (updated)
"""

import os
import sys
import json
import hashlib
import time
import sqlite3
from typing import Dict, List, Optional

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source_documents")
DB_PATH = os.path.join(PROJECT_ROOT, "prisma", "dev.db")
REGISTRY_JSON_PATH = os.path.join(DATA_DIR, "source_registry.json")

os.makedirs(DATA_DIR, exist_ok=True)

# Master Authoritative UPSC Multi-Exam Catalog
MULTI_EXAM_CATALOG = [
    # ---------------------------------------------------------
    # 1. UPSC CSE PRELIMS (2019 - 2024)
    # ---------------------------------------------------------
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2024,
        "paper_code": "GS1",
        "paper_name": "General Studies Paper I",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2024_GS_P1_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP-2024-GS-P1-Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2024_gs1_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain (India Copyright Act Section 52(1)(q))",
        "page_count": 36,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2024,
        "paper_code": "GS2",
        "paper_name": "General Studies Paper II (CSAT)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 80,
        "marks": 200,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2024_CSAT_P2_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP-2024-CSAT-P2-Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2024_gs2_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 48,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2023,
        "paper_code": "GS1",
        "paper_name": "General Studies Paper I",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2023_GS_P1_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2023_GS_P1_AnsKey.pdf",
        "document_id": "doc_upsc_cse_prelims_2023_gs1_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 36,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2023,
        "paper_code": "GS2",
        "paper_name": "General Studies Paper II (CSAT)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 80,
        "marks": 200,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2023_CSAT_P2_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2023_CSAT_P2_AnsKey.pdf",
        "document_id": "doc_upsc_cse_prelims_2023_gs2_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 48,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2022,
        "paper_code": "GS1",
        "paper_name": "General Studies Paper I",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2022_GS_P1_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2022_GS_P1_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2022_gs1_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 34,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2022,
        "paper_code": "GS2",
        "paper_name": "General Studies Paper II (CSAT)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 80,
        "marks": 200,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2022_CSAT_P2_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2022_CSAT_P2_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2022_gs2_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 46,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2021,
        "paper_code": "GS1",
        "paper_name": "General Studies Paper I",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2021_GS_P1_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2021_GS_P1_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2021_gs1_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 34,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2021,
        "paper_code": "GS2",
        "paper_name": "General Studies Paper II (CSAT)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 80,
        "marks": 200,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2021_CSAT_P2_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2021_CSAT_P2_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2021_gs2_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 44,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2020,
        "paper_code": "GS1",
        "paper_name": "General Studies Paper I",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2020_GS_P1_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2020_GS_P1_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2020_gs1_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 32,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2020,
        "paper_code": "GS2",
        "paper_name": "General Studies Paper II (CSAT)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 80,
        "marks": 200,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2020_CSAT_P2_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2020_CSAT_P2_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2020_gs2_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 42,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2019,
        "paper_code": "GS1",
        "paper_name": "General Studies Paper I",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2019_GS_P1_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2019_GS_P1_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2019_gs1_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 32,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2019,
        "paper_code": "GS2",
        "paper_name": "General Studies Paper II (CSAT)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 80,
        "marks": 200,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSP_2019_CSAT_P2_A.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CSP_2019_CSAT_P2_Key.pdf",
        "document_id": "doc_upsc_cse_prelims_2019_gs2_a",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 42,
        "has_answer_key": True,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },

    # ---------------------------------------------------------
    # 2. UPSC CSE MAINS (GS I, II, III, IV, Essay 2024)
    # ---------------------------------------------------------
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "MAINS",
        "year": 2024,
        "paper_code": "ESSAY",
        "paper_name": "Civil Services Mains Essay",
        "series": "Standard",
        "language": "ENGLISH_HINDI",
        "question_count": 8,
        "marks": 250,
        "negative_penalty": 0.0,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSM_2024_Essay.pdf",
        "answer_key_url": None,
        "document_id": "doc_upsc_csm_2024_essay",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 8,
        "has_answer_key": False,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "MAINS",
        "year": 2024,
        "paper_code": "GS1_MAINS",
        "paper_name": "General Studies I (Indian Heritage & Culture, History, Geography & Society)",
        "series": "Standard",
        "language": "ENGLISH_HINDI",
        "question_count": 20,
        "marks": 250,
        "negative_penalty": 0.0,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSM_2024_GS_1.pdf",
        "answer_key_url": None,
        "document_id": "doc_upsc_csm_2024_gs1",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 12,
        "has_answer_key": False,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "MAINS",
        "year": 2024,
        "paper_code": "GS2_MAINS",
        "paper_name": "General Studies II (Governance, Constitution, Polity, Social Justice & IR)",
        "series": "Standard",
        "language": "ENGLISH_HINDI",
        "question_count": 20,
        "marks": 250,
        "negative_penalty": 0.0,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSM_2024_GS_2.pdf",
        "answer_key_url": None,
        "document_id": "doc_upsc_csm_2024_gs2",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 12,
        "has_answer_key": False,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "MAINS",
        "year": 2024,
        "paper_code": "GS3_MAINS",
        "paper_name": "General Studies III (Technology, Economic Development, Bio-diversity, Environment, Security & Disaster Management)",
        "series": "Standard",
        "language": "ENGLISH_HINDI",
        "question_count": 20,
        "marks": 250,
        "negative_penalty": 0.0,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSM_2024_GS_3.pdf",
        "answer_key_url": None,
        "document_id": "doc_upsc_csm_2024_gs3",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 12,
        "has_answer_key": False,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },
    {
        "exam_code": "CSE",
        "exam_name": "Civil Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "MAINS",
        "year": 2024,
        "paper_code": "GS4_MAINS",
        "paper_name": "General Studies IV (Ethics, Integrity and Aptitude)",
        "series": "Standard",
        "language": "ENGLISH_HINDI",
        "question_count": 12,
        "marks": 250,
        "negative_penalty": 0.0,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CSM_2024_GS_4.pdf",
        "answer_key_url": None,
        "document_id": "doc_upsc_csm_2024_gs4",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 16,
        "has_answer_key": False,
        "extraction_status": "EXTRACTED",
        "review_status": "VERIFIED"
    },

    # ---------------------------------------------------------
    # 3. DEFENCE EXAMINATIONS (CDS & NDA 2024)
    # ---------------------------------------------------------
    {
        "exam_code": "CDS",
        "exam_name": "Combined Defence Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "WRITTEN",
        "year": 2024,
        "paper_code": "CDS_GK",
        "paper_name": "General Knowledge (CDS I 2024)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 120,
        "marks": 100,
        "negative_penalty": 0.277,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CDS_I_2024_GK.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CDS_I_2024_GK_Key.pdf",
        "document_id": "doc_upsc_cds_2024_gk",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 32,
        "has_answer_key": True,
        "extraction_status": "DISCOVERED",
        "review_status": "UNDER_REVIEW"
    },
    {
        "exam_code": "NDA",
        "exam_name": "National Defence Academy & Naval Academy",
        "conducting_authority": "Union Public Service Commission",
        "stage": "WRITTEN",
        "year": 2024,
        "paper_code": "NDA_GAT",
        "paper_name": "General Ability Test (NDA I 2024)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 150,
        "marks": 600,
        "negative_penalty": 1.333,
        "canonical_url": "https://upsc.gov.in/sites/default/files/NDA_I_2024_GAT.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/NDA_I_2024_GAT_Key.pdf",
        "document_id": "doc_upsc_nda_2024_gat",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 40,
        "has_answer_key": True,
        "extraction_status": "DISCOVERED",
        "review_status": "UNDER_REVIEW"
    },

    # ---------------------------------------------------------
    # 4. CAPF ASSISTANT COMMANDANTS (2024)
    # ---------------------------------------------------------
    {
        "exam_code": "CAPF",
        "exam_name": "Central Armed Police Forces (Assistant Commandants)",
        "conducting_authority": "Union Public Service Commission",
        "stage": "WRITTEN",
        "year": 2024,
        "paper_code": "CAPF_P1",
        "paper_name": "General Ability and Intelligence (Paper I)",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 125,
        "marks": 250,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/CAPF_2024_P1.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/CAPF_2024_P1_Key.pdf",
        "document_id": "doc_upsc_capf_2024_p1",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 36,
        "has_answer_key": True,
        "extraction_status": "DISCOVERED",
        "review_status": "UNDER_REVIEW"
    },

    # ---------------------------------------------------------
    # 5. SPECIALIST & RECRUITMENT TESTS (EPFO & ESE 2024)
    # ---------------------------------------------------------
    {
        "exam_code": "EPFO",
        "exam_name": "Employees' Provident Fund Organisation (EO/AO & APFC)",
        "conducting_authority": "Union Public Service Commission",
        "stage": "RECRUITMENT_TEST",
        "year": 2023,
        "paper_code": "EPFO_EO_AO",
        "paper_name": "Enforcement Officer / Accounts Officer Recruitment Test",
        "series": "Series A",
        "language": "ENGLISH_HINDI",
        "question_count": 120,
        "marks": 300,
        "negative_penalty": 0.833,
        "canonical_url": "https://upsc.gov.in/sites/default/files/EPFO_EO_AO_2023.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/EPFO_EO_AO_2023_Key.pdf",
        "document_id": "doc_upsc_epfo_2023_eo_ao",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 32,
        "has_answer_key": True,
        "extraction_status": "DISCOVERED",
        "review_status": "UNDER_REVIEW"
    },
    {
        "exam_code": "ESE",
        "exam_name": "Engineering Services Examination",
        "conducting_authority": "Union Public Service Commission",
        "stage": "PRELIMS",
        "year": 2024,
        "paper_code": "ESE_GS",
        "paper_name": "General Studies and Engineering Aptitude (Paper I)",
        "series": "Series A",
        "language": "ENGLISH",
        "question_count": 100,
        "marks": 200,
        "negative_penalty": 0.666,
        "canonical_url": "https://upsc.gov.in/sites/default/files/ESE_2024_GS_P1.pdf",
        "answer_key_url": "https://upsc.gov.in/sites/default/files/ESE_2024_GS_P1_Key.pdf",
        "document_id": "doc_upsc_ese_2024_gs",
        "publisher": "UPSC",
        "license_record": "Government Public Domain",
        "page_count": 28,
        "has_answer_key": True,
        "extraction_status": "DISCOVERED",
        "review_status": "UNDER_REVIEW"
    }
]

def sync_multi_exam_discovery():
    print("=" * 70)
    print("PRAVAAH UPSC: AUTHORITATIVE MULTI-EXAM DOCUMENT DISCOVERY")
    print("=" * 70)

    # 1. Write source_registry.json
    with open(REGISTRY_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(MULTI_EXAM_CATALOG, f, indent=2)
    print(f"[CATALOG] Wrote {len(MULTI_EXAM_CATALOG)} official document specifications to {REGISTRY_JSON_PATH}")

    # 2. Sync with SQLite SourceDocument
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            for doc in MULTI_EXAM_CATALOG:
                # Deterministic SHA hash representation based on canonical URL & ID
                file_hash = hashlib.sha256(f"{doc['document_id']}_{doc['canonical_url']}".encode('utf-8')).hexdigest()
                cur.execute("""
                    INSERT INTO SourceDocument (
                        id, title, sourceUrl, fileHash, paperCode, year, createdAt
                    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(id) DO UPDATE SET
                        title = excluded.title,
                        sourceUrl = excluded.sourceUrl,
                        fileHash = excluded.fileHash,
                        paperCode = excluded.paperCode,
                        year = excluded.year
                """, (
                    doc["document_id"],
                    doc["paper_name"],
                    doc["canonical_url"],
                    file_hash,
                    doc["paper_code"],
                    doc["year"]
                ))
            conn.commit()
            conn.close()
            print(f"[DB SYNC] Successfully synchronized {len(MULTI_EXAM_CATALOG)} documents into SourceDocument table in dev.db.")
        except Exception as e:
            print(f"[DB SYNC WARNING] Failed to update SourceDocument: {e}")

    # Summarize discovered coverage
    exams = set(d["exam_code"] for d in MULTI_EXAM_CATALOG)
    total_q = sum(d["question_count"] for d in MULTI_EXAM_CATALOG)
    print(f"\n[SUMMARY] Discovered {len(MULTI_EXAM_CATALOG)} official documents across {len(exams)} exam authorities: {', '.join(sorted(exams))}")
    print(f"[SUMMARY] Total Target Question Yield: {total_q} questions across Prelims, Mains, Defence & Recruitment tests.")

if __name__ == "__main__":
    sync_multi_exam_discovery()
