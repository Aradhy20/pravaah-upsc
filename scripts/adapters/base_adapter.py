"""
Normalized Question Schema and Base Source Adapter Interface
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class NormalizedOption(BaseModel):
    code: str  # A, B, C, D
    text_en: str
    text_hi: Optional[str] = None
    is_correct: bool = False

class NormalizedQuestion(BaseModel):
    external_source_id: str
    exam_name: str = "UPSC Civil Services Examination"
    year: int
    stage: str = "PRELIMS"  # PRELIMS, MAINS, INTERVIEW
    paper: str  # GS1, GS2 (CSAT), GS1_MAINS, etc.
    question_number: int
    question_type: str = "MCQ"  # MCQ, SUBJECTIVE_MAINS, ESSAY, INTERVIEW
    question_text: str
    question_text_hi: Optional[str] = None
    language: str = "en"
    options: List[NormalizedOption] = Field(default_factory=list)
    correct_answer: Optional[str] = None
    answer_explanation: Optional[str] = None
    answer_source: str = "UPSC_OFFICIAL_FINAL"
    answer_status: str = "OFFICIALLY_VERIFIED"  # OFFICIALLY_VERIFIED, PROVISIONAL, PENDING, DISPUTED
    subject: str
    topic: str
    subtopic: Optional[str] = None
    syllabus_micro_topic: Optional[str] = None
    difficulty: str = "MEDIUM"  # EASY, MEDIUM, HARD
    marks: Optional[float] = 2.0
    word_limit: Optional[int] = None
    source_url: str = ""
    source_document_id: str = ""
    page_number: Optional[int] = None
    extraction_confidence: float = 1.0
    verification_status: str = "OFFICIALLY_VERIFIED"

class BaseSourceAdapter(ABC):
    """Abstract base class for all UPSC question acquisition adapters."""
    
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def discover(self) -> List[Dict[str, Any]]:
        """Discovers available datasets, files, or endpoints."""
        pass

    @abstractmethod
    def extract(self, source_reference: Any) -> List[NormalizedQuestion]:
        """Extracts and normalizes questions from the given source reference."""
        pass

    @abstractmethod
    def validate(self, question: NormalizedQuestion) -> bool:
        """Validates that a question meets minimum quality standards."""
        if not question.question_text or len(question.question_text.strip()) < 5:
            return False
        if question.question_type == "MCQ" and len(question.options) < 4:
            return False
        return True
