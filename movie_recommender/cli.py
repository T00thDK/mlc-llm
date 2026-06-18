"""CLI for the movie recommender agent.

Usage::
    python -m movie_recommender.cli \\
        --user-id me --name "Avery" \\
        --genres sci-fi,thriller,drama \\
        --platforms Netflix,Hulu,"Apple TV","Amazon Prime" \\
        --limit 5 recommend
"""

from __future__ import annotations

import argparse
from typing import List

from .agent import MovieRecommenderAgent
from .memory import MemoryStore
from .models import UserProfile


def _split(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _build_agent(args: argparse.Namespace) -> MovieRecommenderAgent:
    profile = UserProfile(
        user_id=args.user_id,
        display_name=args.name,
        preferred_genres=_split(args.genres) if args.genres else [],
        disliked_genres=_split(args.dislikes) if args.dislikes else [],
        preferred_languages=_split(args.languages) if args.languages else ["en"],
        min_release_year=args.min_year,
        min_user_rating=args.min_rating,
        connected_platforms=_split(args.platforms) if args.platforms else [],
    )
    memory = MemoryStore(path=args.memory) if args.memory else MemoryStore()
    return MovieRecommenderAgent(profile=profile, memory=memory)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="movie_recommender",
        description="AI movie recommender agent (MVP).",
    )
    parser.add_argument("--user-id", required=True)
    parser.add_argument("--name", default="")
    parser.add_argument("--genres", default="")
    parser.add_argument("--dislikes", default="")
    parser.add_argument("--languages", default="en")
    parser.add_argument("--platforms", default="")
    parser.add_argument("--min-year", type=int, default=None)
    parser.add_argument("--min-rating", type=float, default=0.0)
    parser.add_argument("--memory", default=None)

    sub = parser.add_subparsers(dest="command", required=True)

    rec = sub.add_parser("recommend")
    rec.add_argument("--limit", type=int, default=10)

    fb = sub.add_parser("feedback")
    fb.add_argument("title_key")
    fb.add_argument("signal", choices=["liked", "disliked", "watched", "not_interested"])
    fb.add_argument("--note", default="")

    return parser


def main(argv: List[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    agent = _build_agent(args)

    if args.command == "recommend":
        print(agent.recommend_text(limit=args.limit))
        return 0
    if args.command == "feedback":
        agent.record_feedback(args.title_key, args.signal, note=args.note)
        print(f"Recorded {args.signal} for {args.title_key}")
        return 0
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
