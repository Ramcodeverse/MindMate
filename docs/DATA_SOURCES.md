# MindMate Data Sources, Legal Provenance, and Licensing Verification

This document records the official sources, licenses, attribution requirements, and extraction methodologies used for MindMate's recommendation systems and catalog metadata, adhering to Master Prompt 03.

---

## 1. Movie Datasets

### A. MovieLens 100K / 1M / 32M (GroupLens Research)
- **Official Source URL**: `https://grouplens.org/datasets/movielens/`
- **Owner / Institution**: GroupLens Research, Department of Computer Science and Engineering, University of Minnesota.
- **License & Terms**: Non-Commercial Research License. Commercial use requires explicit negotiated agreement with the University of Minnesota Technology Commercialization Office. Redistribution of raw and transformed data is permitted under identical non-commercial license conditions with attribution.
- **Attribution / Citation Requirement**:
  > F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens Datasets: History and Context. ACM Transactions on Interactive Intelligent Systems (TiiS) 5, 4: 19:1–19:19. https://doi.org/10.1145/2827872
- **Fields Extracted**:
  - `movieId` (integer identifier)
  - `title` (standardized English and international titles)
  - `genres` (pipe-delimited taxonomy: Comedy, Drama, Animation, Adventure, Romance, Sci-Fi, etc.)
  - `ratings` (`userId`, `movieId`, `rating` [1.0–5.0], `timestamp`)
  - `tags` (user-contributed mood and thematic keywords: "feel-good", "thought-provoking", "melancholy", "inspiring")
- **Intended Model Usage**:
  - Collaborative filtering matrix factorization (Item-Item Cosine Similarity and SVD baselines).
  - Rating prediction benchmarking (RMSE, MAE).
  - Preference profile vectorization.
- **Verification Date & Method**: Verified October 2026 via GroupLens official license terms.

### B. IMDb Non-Commercial Datasets
- **Official Source URL**: `https://developer.imdb.com/non-commercial-datasets/`
- **Owner**: IMDb.com, Inc. (an Amazon company).
- **License & Terms**: Non-commercial informational use only. Direct bulk redistribution or alteration of raw IMDb databases is restricted.
- **Fields Reference**: `title.basics.tsv.gz` (`tconst`, `primaryTitle`, `startYear`, `runtimeMinutes`, `genres`), `title.ratings.tsv.gz` (`averageRating`, `numVotes`).
- **Intended Usage**: Catalog verification, runtime normalization, and year metadata cross-referencing.

### C. The Movie Database (TMDB)
- **Documentation**: `https://developer.themoviedb.org/docs`
- **Attribution**: "This product uses the TMDB API but is not endorsed or certified by TMDB."
- **Fields**: High-resolution authorized poster URLs, international synopses, and verified cast/crew metadata.

---

## 2. Music Datasets

### A. Free Music Archive (FMA)
- **Official Repository**: `https://github.com/mdeff/fma`
- **Paper / Authors**: Michaël Defferrard, Kirell Benzi, Pierre Vandergheynst, Xavier Bresson (ISMIR 2017).
- **License & Terms**:
  - Code: MIT License.
  - Metadata (`tracks.csv`, `genres.csv`): Creative Commons Attribution 4.0 International (CC BY 4.0).
  - Audio: Individual track licenses vary (Creative Commons / Public Domain). MindMate uses metadata and authorized previews only, never distributing unverified audio files.
- **Fields Extracted**:
  - `track_id`, `track_title`, `artist_name`, `album_title`, `track_duration`
  - `track_genres` (Acoustic, Folk, Ambient, Classical, Electronic, Lo-Fi, Jazz)
  - `echonest_features` (valence, energy, tempo, acousticness, instrumentalness)
- **Intended Usage**: Content-based audio feature matching, valence/energy mood mapping, and baseline track discovery.

### B. Last.fm 360K (LFM-360K)
- **Official Source**: `https://www.cp.jku.at/datasets/LFM-360K/` / `http://ocelma.net/MusicRecommendationDataset/lastfm-360K.html`
- **Author**: Òscar Celma, Music Technology Group, Universitat Pompeu Fabra.
- **License & Terms**: Non-commercial research use only with Last.fm permission. Commercial use requires direct partnership agreement with Last.fm.
- **Fields Extracted**: `<user_id, artist_id, artist_name, plays>` tuples.
- **Intended Usage**: Artist-level implicit feedback modeling, collaborative artist similarity, and user genre affinity profiles.

---

## 3. Data Boundary & Safe Architecture Rules

1. **No Circumvention or Scraping**: All data is ingested from officially documented endpoints, archives, or legitimately provided sample datasets.
2. **Separation of Clinical Data**: Private journal entries and crisis conversation logs are **strictly excluded** from ML recommendation feature tables and training corpora.
3. **Graceful Offline Fallback**: If external network access is unavailable, the pipeline falls back to pre-validated, verified local catalog records in `data/processed/` with 100% deterministic behavior.
