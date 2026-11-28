"""
Authorized CSV Question Adapter
Ingests verified CSV dumps and spreadsheets.
"""

import os
import csv
from typing import List, Dict, Any
from scripts.adapters.base_adapter import BaseSourceAdapter, NormalizedQuestion, NormalizedOption

class AuthorizedCSVAdapter(BaseSourceAdapter):
    def __init__(self):
        super().__init__("AuthorizedCSVAdapter")
        self.csv_path = "/Volumes/DevDrive/pravaah-upsc/exports/import_audit_report.csv"

    def discover(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.csv_path):
            return [{"path": self.csv_path, "type": "CSV_AUDIT_REPORT"}]
        return []

    def extract(self, source_reference: Any = None) -> List[NormalizedQuestion]:
        questions = []
        target = source_reference or self.csv_path
        if not os.path.exists(target):
            return questions

        with open(target, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                norm = NormalizedQuestion(
                    external_source_id=f"csv_{row.get('year')}_{row.get('paperCode')}_{row.get('questionNumber')}",
                    year=int(row.get("year", 2024)),
                    paper=row.get("paperCode", "GS1"),
                    question_number=int(row.get("questionNumber", idx + 1)),
                    question_text=f"Question {row.get('questionNumber')} ({row.get('subjectName')})",
                    subject=row.get("subjectName", "General Studies"),
                    topic=row.get("topicName", "General"),
                    correct_answer=row.get("correctOption"),
                    verification_status=row.get("verificationStatus", "OFFICIALLY_VERIFIED"),
                    source_url=row.get("sourceEn", ""),
                )
                questions.append(norm)

        return questions

    def validate(self, question: NormalizedQuestion) -> bool:
        return super().validate(question)
