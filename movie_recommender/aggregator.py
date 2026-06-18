"""Catalog aggregation across streaming platforms."""

from __future__ import annotations

from typing import Dict, Iterable, List

from .models import Movie
from .providers import StreamingProvider


class CatalogAggregator:
    def __init__(self, providers: Iterable[StreamingProvider]):
        self.providers: List[StreamingProvider] = list(providers)

    def aggregate(self) -> List[Movie]:
        merged: Dict[str, Movie] = {}
        for provider in self.providers:
            for movie in provider.fetch_catalog():
                key = movie.normalized_key()
                if provider.name not in movie.platforms:
                    movie.platforms = [*movie.platforms, provider.name]
                if key not in merged:
                    merged[key] = movie
                    continue
                merged[key] = self._merge(merged[key], movie)
        return list(merged.values())

    @staticmethod
    def _merge(a: Movie, b: Movie) -> Movie:
        return Movie(
            title_id=a.title_id, title=a.title, kind=a.kind,
            genres=list(dict.fromkeys([*a.genres, *b.genres])),
            release_year=a.release_year or b.release_year,
            language=a.language or b.language,
            user_rating=max(a.user_rating, b.user_rating),
            runtime_minutes=a.runtime_minutes or b.runtime_minutes,
            description=a.description or b.description,
            platforms=list(dict.fromkeys([*a.platforms, *b.platforms])),
            poster_url=a.poster_url or b.poster_url,
        )
