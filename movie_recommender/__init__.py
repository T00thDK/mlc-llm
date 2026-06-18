"""AI Movie Recommender Agent.

An MVP agent that discovers, categorizes, and ranks movies/shows across
streaming platforms (Hulu, Apple TV, Netflix, Amazon Prime), delivering
personalized recommendations that adapt to user feedback over time.
"""

from .models import (
    Feedback,
    Movie,
    Recommendation,
    UserProfile,
    ViewingHistoryEntry,
)
from .agent import MovieRecommenderAgent
from .memory import MemoryStore
from .preferences import PreferenceModel
from .ranker import Ranker
from .feedback import FeedbackLearner
from .aggregator import CatalogAggregator
from .providers import (
    AppleTVProvider,
    AmazonPrimeProvider,
    HuluProvider,
    NetflixProvider,
    StreamingProvider,
    default_providers,
)
from .presentation import RecommendationFormatter

__all__ = [
    "AmazonPrimeProvider",
    "AppleTVProvider",
    "CatalogAggregator",
    "Feedback",
    "FeedbackLearner",
    "HuluProvider",
    "MemoryStore",
    "Movie",
    "MovieRecommenderAgent",
    "NetflixProvider",
    "PreferenceModel",
    "Ranker",
    "Recommendation",
    "RecommendationFormatter",
    "StreamingProvider",
    "UserProfile",
    "ViewingHistoryEntry",
    "default_providers",
]
