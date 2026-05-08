# Search — Design Reference

How search works in forkyou. Update this file whenever scoring weights, pipeline logic, or ranking strategy changes.

---

## What we search

| Type | Data sources | Searchable fields |
|---|---|---|
| **Posts** | `PostsContext` (Supabase + mock) | title, cuisine_type, tags, location, creator, body |
| **People** | `MOCK_USERS` + Supabase `users` table | username, full_name |
| **Places** | `RESTAURANTS` mock + Supabase `restaurants` + Google Places Autocomplete | name, cuisine_type, city, address |

---

## Query pipeline

1. Input debounced 300 ms before async calls fire
2. Query lowercased, `#` stripped, split on whitespace → word list
3. Stop words filtered from required-match logic (but still score if matched):
   `food restaurant restaurants place places spot spots the a an in at for and or near with best good great nice`
4. All non-stop words must match at least one field (OR across fields) — posts/places that fail this are excluded (score = 0)
5. Supabase + Google Autocomplete run in parallel via `Promise.all`
6. Google Autocomplete results appended after local/Supabase pool, deduplicated by `place_id` and name

---

## Scoring signals

All signals are **additive** — text score is primary, everything else is a boost on top. An exact name match always wins; boosts only differentiate equally-scored results.

### Text scoring

#### Posts
| Field | Score per word |
|---|---|
| title | +3 |
| cuisine_type (direct) | +3 |
| cuisine_type (via synonym) | +2 |
| tags | +2 |
| location | +2 |
| creator | +1.5 |
| body | +1 |

#### People
| Match type | Score |
|---|---|
| Exact username or name word match | +4 |
| Username starts with word | +3 |
| Username or name contains word | +2 |

#### Places
| Field | Match type | Score per word |
|---|---|---|
| name | Strong (word covers ≥80% of token) | +3 |
| name | Weak (word covers 40–79% of token) | +1 |
| cuisine_type (direct) | substring | +2 |
| cuisine_type (via synonym) | via `CUISINE_SYNONYMS` map | +2 |
| city | Strong token match | +1 |
| city | Weak token match | +0.33 |
| address | Strong token match | +1 |
| address | Weak token match | +0.33 |

The tiered token scoring prevents "indian" from matching "Indianapolis" at full strength — "indianapolis" is only 50% covered by "indian" (< 80%), so it scores at 33% weight. The restaurant still appears, just ranked below actual Indian restaurants.

### Quality boost (posts)
| Food rating | Boost |
|---|---|
| ≥ 4.5 | +1.5 |
| ≥ 4.0 | +0.5 |

### Popularity boost (places)
Measured by number of forkyou posts linked to that restaurant (`post.restaurantId`).

| Post count | Boost |
|---|---|
| ≥ 5 posts | +1.5 |
| ≥ 2 posts | +0.75 |
| ≥ 1 post | +0.25 |

### Distance boost (posts + places)
Requires GPS via `expo-location` (`lib/hooks/useUserLocation.ts`).

| Distance | Boost |
|---|---|
| < 500 m | +5 |
| < 2 km | +3 |
| < 5 km | +1.5 |
| < 15 km | +0.5 |
| ≥ 15 km | 0 |

Google Autocomplete also receives `location={lat},{lng}&radius=10000` when GPS is available.

---

## Cuisine synonym map

`CUISINE_SYNONYMS` in `lib/hooks/useSearch.ts` maps dish/ingredient queries to cuisine types. When a search word has no direct text match, we check if the word maps to a cuisine and score against `cuisine_type`.

Examples:
- `ramen` → `['japanese']` — a Japanese restaurant scores +2 even if "ramen" isn't in its name
- `curry` → `['indian']`
- `dumpling` → `['chinese', 'asian']`
- `taco` → `['mexican']`

Synonym expansion only applies when no direct match was found for that word (i.e., it's a fallback, not an addition to a direct match score).

---

## Industry research

How Yelp, Uber Eats, Google Maps, Zomato, and DoorDash handle search ranking:

| Signal | Yelp | Uber Eats | Google Maps | Zomato | forkyou |
|---|---|---|---|---|---|
| Text relevance | ✓ TF-IDF + LTR | ✓ | ✓ | ✓ LTR | ✓ tiered scoring |
| Proximity | ✓ | ✓ | ✓ | ✓ | ✓ haversine boost |
| Ratings / quality | ✓ | ✓ | ✓ | ✓ | ✓ food rating boost |
| Popularity (post volume) | ✓ | ✓ | ✓ prominence | ✓ | ✓ post count boost |
| Cuisine synonym expansion | ✓ | ✓ knowledge graph | partial | partial | ✓ synonym map |
| Open/closed signal | partial | ✓ | ✓ | ✓ | ✗ |
| Personalisation | ✓ | ✓ | ✓ | ✓ | ✗ |
| Time-of-day signals | partial | ✓ | ✓ | ✓ | ✗ |
| Query expansion (zero results) | ✓ | ✓ query2vec | ✓ | ✓ | ✗ |

### Key findings

**Uber Eats** (most publicly detailed engineering): Uses a knowledge graph to model cuisines and dishes as entities, plus `query2vec` — a learned embedding that maps queries to ordering behavior. "tan tan noodles" expands to "Szechuan" when the dish isn't available. Our `CUISINE_SYNONYMS` map is the practical equivalent at our scale.

**Yelp**: Combines Elasticsearch BM25 scores as features into an ML learning-to-rank model. Business name, location text, geographic distance, phone matching, and review signals are all features. At our scale, hand-tuned additive scoring achieves a similar ordering.

**Google Maps**: Ranks on three pillars — Relevance (text + categories), Distance, and Prominence (popularity, review count, links). We now match all three.

**Zomato**: Tracks `search_id` chains to understand how queries evolve in a session. Also uses regional popularity patterns — dishes trending in a suburb rank higher for users in that suburb.

**DoorDash**: Uses Upper Confidence Bound (UCB) to give new restaurants visibility alongside established ones. Prevents popular restaurants from monopolising results.

---

## Tuning log

| Date | Change | Reason |
|---|---|---|
| 2026-05-08 | Initial text scoring weights | Baseline |
| 2026-05-08 | Added distance boost + Google location bias | Nearby results should rank above distant ones for generic queries |
| 2026-05-08 | Tiered token scoring for place name/city/address fields | "indian" was ranking equal to "Indianapolis" — now: strong match (≥80% coverage) = full score, weak (40–79%) = 33%. Irrelevant places still show up, just ranked below relevant ones |
| 2026-05-08 | Cuisine synonym map (`CUISINE_SYNONYMS`) | "ramen" now surfaces Japanese restaurants even without "ramen" in the name — mirrors Uber Eats knowledge graph approach at our scale |
| 2026-05-08 | Quality boost for posts (food rating) | Higher-rated posts float above equal-scored ones — mirrors Yelp/Google quality signal |
| 2026-05-08 | Popularity boost for places (forkyou post count) | Places with more community activity rank higher — mirrors Google prominence signal |

---

## Known limitations

- Posts only get distance boost when `lat`/`lng` are set — untagged posts don't benefit
- Supabase `restaurants` query is text-only (no PostGIS bounding box); returns up to 10 results, then scored locally
- Google Autocomplete bias radius is fixed at 10 km
- People results have no quality or distance signal (no location data on users)
- Popularity boost uses `post.restaurantId` linkage — posts without a linked restaurant don't contribute

---

## Improvement backlog

### High impact
- [ ] **Open/closed signal**: demote currently-closed places slightly — requires fetching hours from Google Places API during search (expensive) or caching hours in Supabase `restaurants` table
- [ ] **Personalisation**: boost cuisine types the user has posted/saved before; boost places already saved by the user
- [ ] **Query expansion for zero results**: when a query returns nothing, expand to parent cuisine category (e.g. "tan tan noodles" → "Chinese")

### Medium impact
- [ ] **Time-of-day hints**: weight brunch/breakfast queries higher in the morning, dinner queries in the evening
- [ ] **PostGIS bounding box**: add `ST_DWithin` filter to Supabase query to pre-filter restaurants by distance before scoring
- [ ] **Explore vs. popular balance**: give new restaurants without many posts a small visibility boost (DoorDash UCB approach) to avoid filter bubbles
- [ ] **"Near you" label**: show "Showing results near Surry Hills" in section header when GPS active

### Low impact / future
- [ ] Full-text search index on Supabase for posts (currently client-side only)
- [ ] User-adjustable search radius in settings
- [ ] Session-aware query chains (Zomato `search_id` pattern)
- [ ] Cuisine taxonomy — handle singular/plural aliases automatically ("taco"/"tacos", "dumpling"/"dumplings") instead of listing both
