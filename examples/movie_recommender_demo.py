"""End-to-end demo of the movie recommender agent."""

from __future__ import annotations

import os
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from movie_recommender import (
    MemoryStore,
    MovieRecommenderAgent,
    UserProfile,
    ViewingHistoryEntry,
)


def main() -> int:
    profile = UserProfile(
        user_id="demo-user",
        display_name="Avery",
        preferred_genres=["sci-fi", "thriller", "drama"],
        disliked_genres=["horror"],
        preferred_languages=["en", "ja"],
        min_user_rating=6.5,
        connected_platforms=["Netflix", "Hulu", "Apple TV", "Amazon Prime"],
    )

    with tempfile.TemporaryDirectory() as tmp:
        memory = MemoryStore(path=os.path.join(tmp, "state.json"))
        agent = MovieRecommenderAgent(profile=profile, memory=memory)

        agent.ingest_history([
            ViewingHistoryEntry(
                title_id="nf-xyz", title="Orbital Silence", platform="Netflix",
                watched_at="2026-01-04T21:30:00Z", completion=1.0,
                user_score=9.0, genres=["sci-fi", "thriller"],
                language="en", release_year=2024,
            ),
            ViewingHistoryEntry(
                title_id="hl-foo", title="Kyoto Rain", platform="Hulu",
                watched_at="2026-02-11T19:00:00Z", completion=1.0,
                user_score=8.5, genres=["drama", "romance"],
                language="ja", release_year=2021,
            ),
            ViewingHistoryEntry(
                title_id="ap-bar", title="Comedy Central Hour", platform="Amazon Prime",
                watched_at="2026-02-15T23:00:00Z", completion=0.25,
                user_score=3.0, genres=["comedy"], language="en", release_year=2017,
            ),
        ])

        print("=" * 60)
        print("Round 1 — initial recommendations")
        print("=" * 60)
        first = agent.recommend(limit=5)
        print(agent.formatter.as_text(first))

        if not first:
            return 0

        print()
        print("Recording feedback: liked #1, not_interested in #2")
        agent.record_feedback(first[0].movie.normalized_key(), "liked")
        if len(first) > 1:
            agent.record_feedback(first[1].movie.normalized_key(), "not_interested")

        print()
        print("=" * 60)
        print("Round 2 — after feedback")
        print("=" * 60)
        print(agent.recommend_text(limit=5))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
