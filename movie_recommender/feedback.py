"""Continuous learning from user feedback."""

from __future__ import annotations

from datetime import datetime, timezone

from .memory import MemoryStore
from .models import Feedback


class FeedbackLearner:
    def __init__(self, memory: MemoryStore):
        self.memory = memory

    def record(self, title_key: str, signal: str, note: str = "") -> Feedback:
        event = Feedback(
            title_key=title_key, signal=signal, note=note,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self.memory.add_feedback(event)
        return event
