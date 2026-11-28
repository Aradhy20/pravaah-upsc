"""
Manual Admin Question Adapter & Ingestion Registry
Provides manual editorial intake and coordinates all source adapters.
"""

from typing import List, Dict, Any, Optional
from scripts.adapters.base_adapter import BaseSourceAdapter, NormalizedQuestion, NormalizedOption
from scripts.adapters.examside_adapter import ExamSideAdapter
from scripts.adapters.official_upsc_adapter import OfficialUPSCAdapter
from scripts.adapters.local_pdf_adapter import LocalPDFAdapter
from scripts.adapters.authorized_csv_adapter import AuthorizedCSVAdapter

class ManualAdminAdapter(BaseSourceAdapter):
    def __init__(self):
        super().__init__("ManualAdminAdapter")

    def discover(self) -> List[Dict[str, Any]]:
        return [{"channel": "ADMIN_EDITORIAL_PORTAL", "status": "READY"}]

    def extract(self, source_reference: Any) -> List[NormalizedQuestion]:
        """Expects a dictionary or list of raw questions from admin console."""
        raw_list = source_reference if isinstance(source_reference, list) else [source_reference]
        results = []
        for q in raw_list:
            if not isinstance(q, dict):
                continue
            opts = [
                NormalizedOption(
                    code=o.get("code", "A"),
                    text_en=o.get("text", ""),
                    is_correct=o.get("isCorrect", False)
                ) for o in q.get("options", [])
            ]
            norm = NormalizedQuestion(
                external_source_id=f"admin_manual_{q.get('year', 2024)}_{q.get('questionNumber', 1)}",
                year=q.get("year", 2024),
                paper=q.get("paperCode", "GS1"),
                question_number=q.get("questionNumber", 1),
                question_text=q.get("questionText", ""),
                options=opts,
                correct_answer=q.get("correctOption"),
                answer_source="ADMIN_EDITORIAL_BOARD",
                subject=q.get("subject", "General Studies"),
                topic=q.get("topic", "General"),
                verification_status="PENDING_EDITORIAL_APPROVAL"
            )
            if self.validate(norm):
                results.append(norm)
        return results

    def validate(self, question: NormalizedQuestion) -> bool:
        return super().validate(question)


class SourceAdapterRegistry:
    def __init__(self):
        self.adapters: Dict[str, BaseSourceAdapter] = {
            "examside": ExamSideAdapter(),
            "official_upsc": OfficialUPSCAdapter(),
            "local_pdf": LocalPDFAdapter(),
            "authorized_csv": AuthorizedCSVAdapter(),
            "manual_admin": ManualAdminAdapter()
        }

    def get_adapter(self, name: str) -> Optional[BaseSourceAdapter]:
        return self.adapters.get(name.lower())

    def list_adapters(self) -> List[Dict[str, Any]]:
        return [
            {"name": k, "class": v.__class__.__name__, "status": "ACTIVE"}
            for k, v in self.adapters.items()
        ]

    def extract_from(self, adapter_name: str, source_reference: Any = None) -> List[NormalizedQuestion]:
        adapter = self.get_adapter(adapter_name)
        if not adapter:
            raise ValueError(f"Unknown adapter: {adapter_name}")
        return adapter.extract(source_reference)


# Global registry instance
source_registry = SourceAdapterRegistry()
