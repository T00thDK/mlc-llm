"""Allow ``python -m movie_recommender`` to invoke the CLI."""

from .cli import main

raise SystemExit(main())
