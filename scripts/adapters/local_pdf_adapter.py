"""
Local PDF Question Bank Adapter
Wraps local PyMuPDF / fitz extraction pipeline.
"""

import os
import glob
from typing import List, Dict, Any
from scripts.adapters.base_adapter import BaseSourceAdapter, NormalizedQuestion
from scripts.adapters.examside_adapter import ExamSideAdapter

class LocalPDFAdapter(BaseSourceAdapter):
    def __init__(self):
        super().__init__("LocalPDFAdapter")
        self.import_dir = "/Volumes/DevDrive/pravaah-upsc/data/imports/examgoal"

    def discover(self) -> List[Dict[str, Any]]:
        pdfs = glob.glob(f"{self.import_dir}/**/*.pdf", recursive=True)
        return [{"path": p, "name": os.path.basename(p), "size": os.path.getsize(p)} for p in pdfs]

    def extract(self, source_reference: Any = None) -> List[NormalizedQuestion]:
        # Leverages the structured bilingual extraction pipeline
        delegated = ExamSideAdapter()
        return delegated.extract(source_reference)

    def validate(self, question: NormalizedQuestion) -> bool:
        return super().validate(question)
