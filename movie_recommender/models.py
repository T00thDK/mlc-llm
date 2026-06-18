"""Core data models for the movie recommender agent."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class Movie:
    title_id: str
    title: str
    kind: str
    genres: List[str] = field(default_factory=list)
    release_year: Optional[int] = None
    language: str = "en"
    user_rating: float = 0.0
    runtime_minutes: Optional[int] = None
    description: str = ""
    platforms: List[str] = field(default_factory=list)
    poster_url: Optional[str] = None

    def normalized_key(self) -> str:
        slug = "".join(ch.lower() for ch in self.title if ch.isalnum())
        return f"{slug}:{self.release_year or 0}"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ViewingHistoryEntry:
    title_id: str
    title: str
    platform: str
    watched_at: str
    completion: float = 1.0
    user_score: Optional[float] = None
    genres: List[str] = field(default_factory=list)
    language: str = "en"
    release_year: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Feedback:
    title_key: str
    signal: str
    note: str = ""
    created_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class UserProfile:
    user_id: str
    display_name: str = ""
    preferred_genres: List[str] = field(default_factory=list)
    disliked_genres: List[str] = field(default_factory=list)
    preferred_languages: List[str] = field(default_factory=lambda: ["en"])
    min_release_year: Optional[int] = None
    min_user_rating: float = 0.0
    connected_platforms: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Recommendation:
    movie: Movie
    score: float
    reasons: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "movie": self.movie.to_dict(),
            "score": self.score,
            "reasons": list(self.reasons),
        }
