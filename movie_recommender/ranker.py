"""Ranking algorithm.

Transparent linear model over preference weights with platform
availability, recency, quality bonuses, and human-readable reasons.
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, Iterable, List, Optional, Set

from .models import Movie, Recommendation, UserProfile


class Ranker:
    MIN_SCORE: float = 0.0
    QUALITY_WEIGHT: float = 0.35
    RECENCY_WEIGHT: float = 0.15
    PLATFORM_WEIGHT: float = 0.6

    def rank(
        self,
        catalog: Iterable[Movie],
        weights: Dict[str, float],
        profile: UserProfile,
        watched_keys: Optional[Set[str]] = None,
        limit: int = 10,
    ) -> List[Recommendation]:
        watched_keys = watched_keys or set()
        connected = {p.lower() for p in profile.connected_platforms}
        current_year = datetime.utcnow().year

        results: List[Recommendation] = []
        for movie in catalog:
            if movie.normalized_key() in watched_keys:
                continue
            if profile.min_release_year and movie.release_year and movie.release_year < profile.min_release_year:
                continue
            if movie.user_rating < profile.min_user_rating:
                continue

            score = 0.0
            reasons: List[str] = []

            for genre in movie.genres:
                w = weights.get(f"genre:{genre.lower()}", 0.0)
                if w:
                    score += w
                    if w > 0.5:
                        reasons.append(f"matches your interest in {genre}")
                    elif w < -0.5:
                        reasons.append(f"contains {genre}, which you tend to skip")

            lang_w = weights.get(f"language:{movie.language.lower()}", 0.0)
            score += lang_w
            if lang_w > 0.5 and movie.language != "en":
                reasons.append(f"in a language you watch ({movie.language})")

            if movie.release_year:
                decade = (movie.release_year // 10) * 10
                score += weights.get(f"era:{decade}", 0.0)

            score += self.QUALITY_WEIGHT * ((movie.user_rating - 5.0) / 5.0)
            if movie.user_rating >= 8.0:
                reasons.append(f"highly rated ({movie.user_rating:.1f}/10)")

            if movie.release_year:
                age = max(0, current_year - movie.release_year)
                recency = max(0.0, 1.0 - age / 10.0)
                score += self.RECENCY_WEIGHT * recency

            available_on = [p for p in movie.platforms if p.lower() in connected]
            if connected:
                if available_on:
                    score += self.PLATFORM_WEIGHT
                    reasons.append("available on " + ", ".join(available_on))
                else:
                    score -= self.PLATFORM_WEIGHT

            title_w = weights.get(f"title:{movie.normalized_key()}", 0.0)
            score += title_w * 2.0
            if title_w < 0:
                continue

            if score < self.MIN_SCORE:
                continue
            if not reasons:
                reasons.append("broadly matches your taste profile")

            results.append(Recommendation(movie=movie, score=round(score, 4), reasons=reasons[:3]))

        results.sort(key=lambda r: r.score, reverse=True)
        return results[:limit]
