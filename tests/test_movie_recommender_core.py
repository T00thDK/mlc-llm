"""Tests for the core data layer of the movie recommender."""

from __future__ import annotations

import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from movie_recommender import (  # noqa: E402
    CatalogAggregator,
    MemoryStore,
    UserProfile,
    ViewingHistoryEntry,
    default_providers,
)
from movie_recommender.models import Feedback  # noqa: E402


def _basic_profile() -> UserProfile:
    return UserProfile(
        user_id="u1",
        display_name="Test",
        preferred_genres=["sci-fi", "thriller"],
        disliked_genres=["horror"],
        preferred_languages=["en"],
        connected_platforms=["Netflix", "Hulu", "Apple TV", "Amazon Prime"],
    )


class AggregatorTests(unittest.TestCase):
    def test_dedup_across_providers(self) -> None:
        catalog = CatalogAggregator(default_providers()).aggregate()
        cartographers = [m for m in catalog if m.title == "Midnight Cartographer"]
        self.assertEqual(len(cartographers), 1)
        merged = cartographers[0]
        self.assertIn("Netflix", merged.platforms)
        self.assertIn("Hulu", merged.platforms)

    def test_each_title_has_a_platform(self) -> None:
        catalog = CatalogAggregator(default_providers()).aggregate()
        for movie in catalog:
            self.assertTrue(movie.platforms, f"{movie.title} has no platforms")

    def test_aggregate_preserves_genres_union(self) -> None:
        catalog = CatalogAggregator(default_providers()).aggregate()
        paper = [m for m in catalog if m.title == "Paper Lanterns"]
        self.assertEqual(len(paper), 1)
        self.assertIn("Hulu", paper[0].platforms)
        self.assertIn("Apple TV", paper[0].platforms)


class MemoryStoreTests(unittest.TestCase):
    def test_roundtrip_persistence(self) -> None:
        profile = _basic_profile()
        entry = ViewingHistoryEntry(
            title_id="x", title="Foo", platform="Netflix",
            watched_at="2026-01-01T00:00:00Z", genres=["drama"],
            language="en", release_year=2022, user_score=8.0,
        )
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "state.json")
            store = MemoryStore(path=path)
            store.set_profile(profile)
            store.add_history([entry])
            store.add_feedback(Feedback(title_key="foo:2022", signal="liked",
                                        created_at="2026-01-02T00:00:00Z"))

            reopened = MemoryStore(path=path)
            self.assertEqual(reopened.get_profile(), profile)
            self.assertEqual(len(reopened.get_history()), 1)
            self.assertEqual(reopened.get_history()[0].title, "Foo")
            self.assertEqual(len(reopened.get_feedback()), 1)

    def test_history_dedup(self) -> None:
        store = MemoryStore()
        entry = ViewingHistoryEntry(
            title_id="x", title="Foo", platform="Netflix",
            watched_at="2026-01-01T00:00:00Z",
        )
        store.add_history([entry, entry])
        store.add_history([entry])
        self.assertEqual(len(store.get_history()), 1)

    def test_in_memory_store_works(self) -> None:
        store = MemoryStore()
        store.set_profile(_basic_profile())
        self.assertIsNotNone(store.get_profile())
        store.set_preference_weights({"genre:sci-fi": 1.5})
        self.assertEqual(store.get_preference_weights()["genre:sci-fi"], 1.5)


if __name__ == "__main__":
    unittest.main()
