"""AI Movie Recommender Agent — core data layer.

Data models, streaming-platform providers, catalog aggregation, and
persistent memory that the ranking and agent layers build on.
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

__all__ = [
    "AmazonPrimeProvider",
    "AppleTVProvider",
    "CatalogAggregator",
    "Feedback",
    "HuluProvider",
    "MemoryStore",
    "Movie",
    "NetflixProvider",
    "Recommendation",
    "StreamingProvider",
    "UserProfile",
    "ViewingHistoryEntry",
    "default_providers",
]
