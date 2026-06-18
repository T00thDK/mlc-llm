"""Tests for the ranking engine of the movie recommender."""

from __future__ import annotations

import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from movie_recommender import PreferenceModel, Ranker
from movie_recommender.models import Feedback, Movie, UserProfile, ViewingHistoryEntry


def _basic_profile() -> UserProfile:
    return UserProfile(
        user_id="u1",
        preferred_genres=["sci-fi", "thriller"],
        disliked_genres=["horror"],
        preferred_languages=["en"],
        connected_platforms=["Netflix", "Hulu", "Apple TV", "Amazon Prime"],
    )


class PreferenceModelTests(unittest.TestCase):
    def test_liked_history_boosts_genre(self) -> None:
        model = PreferenceModel()
        history = [
            ViewingHistoryEntry(
                title_id="x", title="Foo", platform="Netflix",
                watched_at="2026-01-01T00:00:00Z",
                completion=1.0, user_score=9.0,
                genres=["sci-fi"], language="en", release_year=2024,
            )
        ]
        weights = model.build(UserProfile(user_id="u1"), history, feedback=[])
        self.assertGreater(weights["genre:sci-fi"], 0)
        self.assertGreater(weights["era:2020"], 0)

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

    def test_declared_preferred_genre_boost(self) -> None:
        weights = PreferenceModel().build(
            UserProfile(user_id="u1", preferred_genres=["drama"]),
            history=[], feedback=[],
        )
        self.assertGreater(weights["genre:drama"], 0)


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
        weights = {"title:spacerun:2024": -1.0, "genre:sci-fi": 2.0}
        recs = Ranker().rank([movie], weights, profile)
        self.assertEqual(recs, [])

    def test_min_rating_filter(self) -> None:
        profile = UserProfile(user_id="u1", min_user_rating=8.0,
                              connected_platforms=["Netflix"])
        catalog = [
            Movie(title_id="a", title="Low Rated", kind="movie",
                  genres=["drama"], release_year=2024, user_rating=5.0,
                  platforms=["Netflix"]),
        ]
        recs = Ranker().rank(catalog, {}, profile)
        self.assertEqual(recs, [])

    def test_recommendations_have_reasons(self) -> None:
        profile = _basic_profile()
        catalog = [
            Movie(title_id="a", title="Space Run", kind="movie",
                  genres=["sci-fi"], release_year=2024, user_rating=8.5,
                  platforms=["Netflix"]),
        ]
        weights = PreferenceModel().build(profile, history=[], feedback=[])
        recs = Ranker().rank(catalog, weights, profile)
        self.assertTrue(recs)
        self.assertTrue(recs[0].reasons)


if __name__ == "__main__":
    unittest.main()
