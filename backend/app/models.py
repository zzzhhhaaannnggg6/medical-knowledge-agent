from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class DocumentLoadRequest(BaseModel):
    paths: list[str] = Field(default_factory=list)
    max_pages_per_document: int = Field(default=40, ge=1, le=120)


class RagQuery(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    top_k: int = Field(default=3, ge=1, le=8)


FeedbackAction = Literal["keep", "remove", "merge", "split"]


class FeedbackRequest(BaseModel):
    decision_id: str
    action: FeedbackAction
    note: str = Field(default="模拟教师反馈")
    target_node_ids: list[str] = Field(default_factory=list)
    new_name: str | None = None
