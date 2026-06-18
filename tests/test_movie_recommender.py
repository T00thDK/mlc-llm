"""Full test suite for the movie recommender agent."""

from __future__ import annotations

import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from movie_recommender import (
    CatalogAggregator,
    MemoryStore,
    MovieRecommenderAgent,
    PreferenceModel,
    Ranker,
    UserProfile,
    ViewingHistoryEntry,
    default_providers,
)
from movie_recommender.models import Feedback, Movie
from movie_recommender.providers import (
    AmazonPrimeProvider,
    AppleTVProvider,
    HuluProvider,
    NetflixProvider,
)


def _basic_profile() -> UserProfile:
    return UserProfile(
        user_id="u1",
        display_name="Test",
        preferred_genres=["sci-fi", "thriller"],
        disliked_genres=["horror"],
        preferred_languages=["en"],
        connected_platforms=["Netflix", "Hulu", "Apple TV", "Amazon Prime"],
        min_user_rating=0.0,
    )


class AggregatorTests(unittest.TestCase):
    def test_dedup_across_providers(self) -> None:
        agg = CatalogAggregator(default_providers())
        catalog = agg.aggregate()
        cartographers = [m for m in catalog if m.title == "Midnight Cartographer"]
        self.assertEqual(len(cartographers), 1)
        merged = cartographers[0]
        self.assertIn("Netflix", merged.platforms)
        self.assertIn("Hulu", merged.platforms)

    def test_each_title_has_a_platform(self) -> None:
        catalog = CatalogAggregator(default_providers()).aggregate()
        for movie in catalog:
            self.assertTrue(movie.platforms, f"{movie.title} has no platforms")


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


class PreferenceModelTests(unittest.TestCase):
    def test_liked_history_boosts_genre(self) -> None:
        history = [
            ViewingHistoryEntry(
                title_id="x", title="Foo", platform="Netflix",
                watched_at="2026-01-01T00:00:00Z",
                completion=1.0, user_score=9.0,
                genres=["sci-fi"], language="en", release_year=2024,
            )
        ]
        weights = PreferenceModel().build(UserProfile(user_id="u1"), history, feedback=[])
        self.assertGreater(weights["genre:sci-fi"], 0)

    def test_disliked_genre_is_negative(self) -> None:
        weights = PreferenceModel().build(
            UserProfile(user_id="u1", disliked_genres=["horror"]),
            history=[], feedback=[],
        )
        self.assertLess(weights["genre:horror"], 0)

    def test_feedback_shifts_title_weight(self) -> None:
        weights = PreferenceModel().build(
            UserProfile(user_id="u1"), history=[],
            feedback=[Feedback(title_key="abc:2024", signal="disliked",
                               created_at="2026-01-01T00:00:00Z")],
        )
        self.assertLess(weights["title:abc:2024"], 0)


class RankerTests(unittest.TestCase):
    def test_ranker_prefers_matching_genre(self) -> None:
        profile = _basic_profile()
        catalog = [
            Movie(title_id="a", title="Space Run", kind="movie",
                  genres=["sci-fi"], release_year=2024, user_rating=7.5,
                  platforms=["Netflix"]),
            Movie(title_id="b", title="Haunt House", kind="movie",
                  genres=["horror"], release_year=2024, user_rating=7.5,
                  platforms=["Netflix"]),
        ]
        weights = PreferenceModel().build(profile, history=[], feedback=[])
        recs = Ranker().rank(catalog, weights, profile)
        self.assertTrue(recs)
        self.assertEqual(recs[0].movie.title, "Space Run")

    def test_ranker_excludes_watched_titles(self) -> None:
        profile = _basic_profile()
        catalog = [
            Movie(title_id="a", title="Space Run", kind="movie",
                  genres=["sci-fi"], release_year=2024, user_rating=7.5,
                  platforms=["Netflix"]),
        ]
        recs = Ranker().rank(catalog, {}, profile, watched_keys={"spacerun:2024"})
        self.assertEqual(recs, [])

    def test_explicit_disliked_title_is_dropped(self) -> None:
        profile = _basic_profile()
        movie = Movie(title_id="a", title="Space Run", kind="movie",
                      genres=["sci-fi"], release_year=2024, user_rating=7.5,
                      platforms=["Netflix"])
        recs = Ranker().rank([movie], {"title:spacerun:2024": -1.0, "genre:sci-fi": 2.0}, profile)
        self.assertEqual(recs, [])


class AgentIntegrationTests(unittest.TestCase):
    def test_end_to_end_recommendation_flow(self) -> None:
        profile = _basic_profile()
        agent = MovieRecommenderAgent(
            profile=profile,
            providers=[NetflixProvider(), HuluProvider(), AppleTVProvider(), AmazonPrimeProvider()],
        )
        agent.ingest_history([
            ViewingHistoryEntry(
                title_id="x", title="Some SciFi Movie", platform="Netflix",
                watched_at="2026-01-01T00:00:00Z",
                completion=1.0, user_score=9.0,
                genres=["sci-fi", "thriller"], language="en", release_year=2024,
            )
        ])
        recs = agent.recommend(limit=5)
        self.assertTrue(recs)
        connected = {p.lower() for p in profile.connected_platforms}
        for rec in recs:
            self.assertTrue(
                any(p.lower() in connected for p in rec.movie.platforms),
                f"{rec.movie.title} not on any connected platform",
            )
        self.assertTrue(all(rec.reasons for rec in recs))

    def test_feedback_changes_ordering(self) -> None:
        agent = MovieRecommenderAgent(profile=_basic_profile())
        first = agent.recommend(limit=5)
        self.assertTrue(first)
        top_key = first[0].movie.normalized_key()
        agent.record_feedback(top_key, "disliked")
        second = agent.recommend(limit=5)
        self.assertNotIn(top_key, [r.movie.normalized_key() for r in second])

    def test_text_presentation_runs(self) -> None:
        agent = MovieRecommenderAgent(profile=_basic_profile())
        text = agent.recommend_text(limit=3)
        self.assertIn("Recommended for you", text)

    def test_cli_recommend(self) -> None:
        from movie_recommender.cli import main
        ret = main(["--user-id", "test", "--genres", "sci-fi", "--platforms", "Netflix", "recommend", "--limit", "3"])
        self.assertEqual(ret, 0)


if __name__ == "__main__":
    unittest.main()
