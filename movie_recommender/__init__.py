"""AI Movie Recommender Agent — ranking engine.

Builds on the core data layer, adding preference modeling, ranking, and
a continuous-learning feedback loop.
"""

from .models import (
    Feedback,
    Movie,
    Recommendation,
    UserProfile,
    ViewingHistoryEntry,
)
from .memory import MemoryStore
from .aggregator import CatalogAggregator
from .providers import (
    AppleTVProvider,
    AmazonPrimeProvider,
    HuluProvider,
    NetflixProvider,
    StreamingProvider,
    default_providers,
)
from .preferences import PreferenceModel
from .ranker import Ranker
from .feedback import FeedbackLearner

__all__ = [
    "AmazonPrimeProvider",
    "AppleTVProvider",
    "CatalogAggregator",
    "Feedback",
    "FeedbackLearner",
    "HuluProvider",
    "MemoryStore",
    "Movie",
    "NetflixProvider",
    "PreferenceModel",
    "Ranker",
    "Recommendation",
    "StreamingProvider",
    "UserProfile",
    "ViewingHistoryEntry",
    "default_providers",
]
