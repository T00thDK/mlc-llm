"""The main AI movie recommender agent orchestrator."""

from __future__ import annotations

from typing import Iterable, List, Optional, Sequence

from .aggregator import CatalogAggregator
from .feedback import FeedbackLearner
from .memory import MemoryStore
from .models import Feedback, Recommendation, UserProfile, ViewingHistoryEntry
from .preferences import PreferenceModel
from .presentation import RecommendationFormatter
from .providers import StreamingProvider, default_providers
from .ranker import Ranker


class MovieRecommenderAgent:
    def __init__(
        self,
        profile: UserProfile,
        providers: Optional[Sequence[StreamingProvider]] = None,
        memory: Optional[MemoryStore] = None,
        preference_model: Optional[PreferenceModel] = None,
        ranker: Optional[Ranker] = None,
        formatter: Optional[RecommendationFormatter] = None,
    ):
        self.profile = profile
        self.providers = list(providers) if providers is not None else default_providers()
        self.memory = memory or MemoryStore()
        self.preference_model = preference_model or PreferenceModel()
        self.ranker = ranker or Ranker()
        self.formatter = formatter or RecommendationFormatter()
        self.aggregator = CatalogAggregator(self.providers)
        self.feedback_learner = FeedbackLearner(self.memory)
        self.memory.set_profile(profile)

    def sync_history_from_providers(self) -> List[ViewingHistoryEntry]:
        collected: List[ViewingHistoryEntry] = []
        for provider in self.providers:
            collected.extend(provider.fetch_history(self.profile.user_id))
        self.memory.add_history(collected)
        return collected

    def ingest_history(self, entries: Iterable[ViewingHistoryEntry]) -> None:
        self.memory.add_history(list(entries))

    def record_feedback(self, title_key: str, signal: str, note: str = "") -> Feedback:
        return self.feedback_learner.record(title_key, signal, note)

    def recommend(self, limit: int = 10) -> List[Recommendation]:
        catalog = self.aggregator.aggregate()
        history = self.memory.get_history()
        feedback = self.memory.get_feedback()

        weights = self.preference_model.build(self.profile, history, feedback)
        self.memory.set_preference_weights(weights)

        watched_keys = {self._history_key(e) for e in history}
        return self.ranker.rank(
            catalog=catalog, weights=weights, profile=self.profile,
            watched_keys=watched_keys, limit=limit,
        )

    def recommend_text(self, limit: int = 10) -> str:
        return self.formatter.as_text(self.recommend(limit=limit))

    @staticmethod
    def _history_key(entry: ViewingHistoryEntry) -> str:
        slug = "".join(ch.lower() for ch in entry.title if ch.isalnum())
        return f"{slug}:{entry.release_year or 0}"
