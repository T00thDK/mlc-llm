"""Presentation layer for formatting recommendations."""

from __future__ import annotations

from typing import Iterable, List

from .models import Recommendation


class RecommendationFormatter:
    def as_text(self, recs: Iterable[Recommendation]) -> str:
        recs = list(recs)
        if not recs:
            return "No recommendations yet — try connecting a platform or logging some viewing history."

        lines: List[str] = []
        lines.append("Recommended for you")
        lines.append("=" * 60)
        for idx, rec in enumerate(recs, start=1):
            movie = rec.movie
            year = f" ({movie.release_year})" if movie.release_year else ""
            platforms = ", ".join(movie.platforms) or "unknown"
            lines.append(f"{idx:>2}. {movie.title}{year}  [{movie.kind}]")
            lines.append(
                f"    score={rec.score:.2f}  rating={movie.user_rating:.1f}  "
                f"platforms={platforms}"
            )
            if movie.genres:
                lines.append(f"    genres: {', '.join(movie.genres)}")
            if rec.reasons:
                lines.append(f"    why: {'; '.join(rec.reasons)}")
            if movie.description:
                lines.append(f"    {movie.description}")
            lines.append("")
        return "\n".join(lines).rstrip()

    def as_json_dicts(self, recs: Iterable[Recommendation]) -> list:
        return [rec.to_dict() for rec in recs]
