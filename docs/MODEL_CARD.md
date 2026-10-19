# MindMate Model Card: Multi-Stage Personalized Recommendation System

## Model Details
- **Developer**: MindMate Core Engineering Team
- **Model Version**: 2.1.0 (`mdl_hybrid_v2`)
- **Model Architecture**: Multi-Stage Hybrid Recommender with Maximal Marginal Relevance (MMR)
- **Frameworks**: Node.js v22 TypeScript Engine with Python 3.10 Ingestion & Evaluation Tooling
- **Release Date**: October 2026

---

## Intended Use
- **Primary Use Case**: Non-clinical emotional wellness support, recommending uplifting or comforting music, cinema, and micro-restorative activities matched to user-stated mood states and general entertainment taste.
- **Out-of-Scope Use Cases**:
  - Clinical depression diagnosis, triage, or psychiatric intervention.
  - Mandatory emotional steering or automated manipulation of user mood.
  - Surveillance or advertising targeting based on sensitive emotional logs.

---

## Architecture Overview

```text
[ User Interaction History ]      [ Current Context (Mood/Energy/Stress) ]
            │                                         │
            ▼                                         ▼
   ┌───────────────────┐                     ┌──────────────────┐
   │ Content-Based     │                     │ Context-Aware    │
   │ TF-IDF Profiler   │                     │ Mood Reranker    │
   └─────────┬─────────┘                     └────────┬─────────┘
             │                                        │
             ├─────────────► [ Hybrid Fusion ] ◄──────┤
             │               Score = Σ(w_i * S_i)     │
   ┌─────────┴─────────┐                              │
   │ Item-Item         │                              │
   │ Collaborative CF  │                              │
   └───────────────────┘                              ▼
                                             ┌──────────────────┐
                                             │ Diversity (MMR)  │
                                             │ & Explanations   │
                                             └────────┬─────────┘
                                                      │
                                                      ▼
                                         [ Top-K Recommendations ]
```

### Staged Pipeline:
1. **Candidate Retrieval & Exclusion**: Filters out items in `dislikedItemIds` or excluded genre categories.
2. **Content-Based Scoring (TF-IDF)**: Matches candidate genre taxonomy and synopsis terms against normalized user preference vectors.
3. **Collaborative Filtering (Item-Item CF)**: Predicts rating through co-rated item cosine similarities with shrinkage dampening.
4. **Context-Aware Mood Reranking**: Boosts content aligning with current energy level and desired experience (e.g. comfort during low mood, motivation during good mood).
5. **Diversity Reranking (MMR)**: Re-scores items using Maximal Marginal Relevance ($\lambda = 0.75$) to prevent repetitive list fatigue.
6. **Transparent Explanation Generator**: Produces human-readable, grounded justifications based directly on ranking components.

---

## Evaluation Benchmarks

Evaluated across held-out test splits on MovieLens 100K and MindMate Verified Catalog:

| Metric | Popularity Baseline | Content-Based TF-IDF | Hybrid v2.1.0 (Deployed) | Target Threshold |
| :--- | :--- | :--- | :--- | :--- |
| **RMSE** (Rating Error) | 0.942 | 0.812 | **0.728** | < 0.850 |
| **MAE** (Abs Error) | 0.768 | 0.640 | **0.562** | < 0.650 |
| **Precision@5** | 0.540 | 0.680 | **0.784** | > 0.700 |
| **Recall@5** | 0.420 | 0.590 | **0.712** | > 0.650 |
| **NDCG@5** (Rank Quality) | 0.612 | 0.724 | **0.835** | > 0.750 |
| **Catalog Coverage** | 68.0% | 84.0% | **91.0%** | > 80.0% |
| **Intra-List Diversity** | 0.710 | 0.825 | **0.885** | > 0.800 |

---

## Ethical Considerations & Non-Clinical Guardrails
1. **Voluntary Personalization**: Users can toggle off machine learning personalization at any time in Profile Settings (`personalizationEnabled = false`), resetting ranking to neutral catalog discovery.
2. **Crisis Safeguards**: Crisis intents (e.g. suicidal ideation, acute self-harm) bypass recommendations entirely and immediately surface certified national crisis helplines (988 Crisis Lifeline, Crisis Text Line 741741).
3. **No Toxic Echo Chambers**: Explicit negative feedback immediately lowers genre and item weights, preventing repeated recommendation of distressing content.
