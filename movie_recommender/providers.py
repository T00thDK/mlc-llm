"""Streaming platform providers with stub catalogs."""

from __future__ import annotations

from typing import Iterable, List

from .models import Movie, ViewingHistoryEntry


class StreamingProvider:
    name: str = "unknown"

    def fetch_catalog(self) -> List[Movie]:
        raise NotImplementedError

    def fetch_history(self, user_id: str) -> List[ViewingHistoryEntry]:
        return []


def _movie(
    title_id: str, title: str, kind: str, genres: Iterable[str],
    year: int, rating: float, language: str = "en",
    runtime: int | None = None, description: str = "",
) -> Movie:
    return Movie(
        title_id=title_id, title=title, kind=kind, genres=list(genres),
        release_year=year, language=language, user_rating=rating,
        runtime_minutes=runtime, description=description,
    )


class NetflixProvider(StreamingProvider):
    name = "Netflix"
    def fetch_catalog(self) -> List[Movie]:
        return [
            _movie("nf-001", "The Quantum Garden", "movie", ["sci-fi", "drama"], 2023, 7.8, description="Two botanists race to decode a flower that blooms out of time."),
            _movie("nf-002", "Midnight Cartographer", "show", ["thriller", "mystery"], 2022, 8.4, description="A cartographer charts a city that only exists after midnight."),
            _movie("nf-003", "Sunset Freeway", "movie", ["drama", "romance"], 2019, 7.2),
            _movie("nf-004", "Iron Kitchen", "show", ["comedy", "food"], 2024, 7.9),
            _movie("nf-005", "Stargazer's Daughter", "movie", ["sci-fi", "family"], 2021, 7.6),
        ]


class HuluProvider(StreamingProvider):
    name = "Hulu"
    def fetch_catalog(self) -> List[Movie]:
        return [
            _movie("hl-001", "Paper Lanterns", "movie", ["drama", "romance"], 2020, 7.4, language="ja", description="A Kyoto lantern maker rekindles a forgotten promise."),
            _movie("hl-002", "Blackout Protocol", "movie", ["thriller", "action"], 2023, 6.9),
            _movie("hl-003", "Midnight Cartographer", "show", ["thriller", "mystery"], 2022, 8.4),
            _movie("hl-004", "Deep Field", "documentary", ["documentary", "science"], 2024, 8.1),
            _movie("hl-005", "Comedy Club 9PM", "show", ["comedy"], 2018, 6.5),
        ]


class AppleTVProvider(StreamingProvider):
    name = "Apple TV"
    def fetch_catalog(self) -> List[Movie]:
        return [
            _movie("at-001", "Atlas Unbound", "show", ["sci-fi", "drama", "thriller"], 2024, 8.7, description="A near-future mapping AI gains contested autonomy."),
            _movie("at-002", "The Slow Current", "movie", ["drama"], 2022, 7.7),
            _movie("at-003", "Kodiak", "movie", ["adventure", "family"], 2021, 7.3),
            _movie("at-004", "Paper Lanterns", "movie", ["drama", "romance"], 2020, 7.4, language="ja"),
            _movie("at-005", "Cipher Street", "show", ["thriller", "crime"], 2023, 8.0),
        ]


class AmazonPrimeProvider(StreamingProvider):
    name = "Amazon Prime"
    def fetch_catalog(self) -> List[Movie]:
        return [
            _movie("ap-001", "Nine Rivers", "show", ["drama", "historical"], 2022, 8.2),
            _movie("ap-002", "Last Orbit", "movie", ["sci-fi", "thriller"], 2024, 7.9, description="A lone astronaut negotiates with a salvage AI."),
            _movie("ap-003", "Dawn Chorus", "documentary", ["documentary", "nature"], 2023, 8.5),
            _movie("ap-004", "Comedy Club 9PM", "show", ["comedy"], 2018, 6.5),
            _movie("ap-005", "Sunset Freeway", "movie", ["drama", "romance"], 2019, 7.2),
        ]


def default_providers() -> List[StreamingProvider]:
    return [NetflixProvider(), HuluProvider(), AppleTVProvider(), AmazonPrimeProvider()]
