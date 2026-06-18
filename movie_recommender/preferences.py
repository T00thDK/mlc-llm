"""Preference modeling — converts signals into interpretable weight vectors."""

from __future__ import annotations

from collections import defaultdict
from typing import Dict, Iterable

from .models import Feedback, UserProfile, ViewingHistoryEntry


class PreferenceModel:
    DECLARED_BOOST: float = 1.5
    DECLARED_PENALTY: float = -2.0

    def build(
        self,
        profile: UserProfile,
        history: Iterable[ViewingHistoryEntry],
        feedback: Iterable[Feedback],
    ) -> Dict[str, float]:
        weights: Dict[str, float] = defaultdict(float)

        for entry in history:
            if entry.user_score is not None:
                affinity = (entry.user_score - 5.0) / 5.0
            else:
                affinity = entry.completion - 0.5
            for genre in entry.genres:
                weights[f"genre:{genre.lower()}"] += affinity
            weights[f"language:{entry.language.lower()}"] += affinity * 0.5
            if entry.release_year:
                decade = (entry.release_year // 10) * 10
                weights[f"era:{decade}"] += affinity * 0.25
            weights[f"platform:{entry.platform.lower()}"] += max(affinity, 0) * 0.25

        for genre in profile.preferred_genres:
            weights[f"genre:{genre.lower()}"] += self.DECLARED_BOOST
        for genre in profile.disliked_genres:
            weights[f"genre:{genre.lower()}"] += self.DECLARED_PENALTY
        for lang in profile.preferred_languages:
            weights[f"language:{lang.lower()}"] += self.DECLARED_BOOST * 0.5
        for platform in profile.connected_platforms:
            weights[f"platform:{platform.lower()}"] += 0.5

        signal_weights = {
            "liked": 1.0, "watched": 0.75,
            "disliked": -1.25, "not_interested": -0.5,
        }
        for event in feedback:
            delta = signal_weights.get(event.signal, 0.0)
            weights[f"title:{event.title_key}"] += delta

        return dict(weights)
