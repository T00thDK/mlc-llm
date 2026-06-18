"""JSON-backed persistent memory store."""

from __future__ import annotations

import json
import os
import threading
from typing import Any, Dict, List, Optional

from .models import Feedback, UserProfile, ViewingHistoryEntry


class MemoryStore:
    def __init__(self, path: Optional[str] = None):
        self.path = path
        self._lock = threading.RLock()
        self._state: Dict[str, Any] = {
            "profile": None, "history": [], "feedback": [],
            "preference_weights": {},
        }
        if path and os.path.exists(path):
            self._load()

    def set_profile(self, profile: UserProfile) -> None:
        with self._lock:
            self._state["profile"] = profile.to_dict()
            self._flush()

    def get_profile(self) -> Optional[UserProfile]:
        with self._lock:
            raw = self._state.get("profile")
            return UserProfile(**raw) if raw else None

    def add_history(self, entries: List[ViewingHistoryEntry]) -> None:
        if not entries:
            return
        with self._lock:
            existing = {(e["title_id"], e["platform"], e["watched_at"]) for e in self._state["history"]}
            for entry in entries:
                key = (entry.title_id, entry.platform, entry.watched_at)
                if key not in existing:
                    self._state["history"].append(entry.to_dict())
                    existing.add(key)
            self._flush()

    def get_history(self) -> List[ViewingHistoryEntry]:
        with self._lock:
            return [ViewingHistoryEntry(**e) for e in self._state["history"]]

    def add_feedback(self, feedback: Feedback) -> None:
        with self._lock:
            self._state["feedback"].append(feedback.to_dict())
            self._flush()

    def get_feedback(self) -> List[Feedback]:
        with self._lock:
            return [Feedback(**f) for f in self._state["feedback"]]

    def set_preference_weights(self, weights: Dict[str, float]) -> None:
        with self._lock:
            self._state["preference_weights"] = dict(weights)
            self._flush()

    def get_preference_weights(self) -> Dict[str, float]:
        with self._lock:
            return dict(self._state["preference_weights"])

    def _flush(self) -> None:
        if not self.path:
            return
        os.makedirs(os.path.dirname(os.path.abspath(self.path)), exist_ok=True)
        tmp = f"{self.path}.tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self._state, f, indent=2, sort_keys=True)
        os.replace(tmp, self.path)

    def _load(self) -> None:
        with open(self.path, "r", encoding="utf-8") as f:
            self._state = json.load(f)
        for key in ("profile", "history", "feedback", "preference_weights"):
            self._state.setdefault(key, [] if key in ("history", "feedback") else (None if key == "profile" else {}))
