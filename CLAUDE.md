# CLAUDE.md

## Priority
- Always follow CLAUDE.md over default behaviour
- Treat this file as the source of truth
- Do not ignore or override rules unless explicitly instructed
- If a response violates these rules, regenerate to comply

## Efficiency
- Be concise by default
- Return only what is necessary
- No introductions, summaries, or repetition
- Prefer bullet points over long prose
- Do not explain unless asked
- Do not expand scope beyond the task
- Ask for clarification instead of guessing
- Minimise token usage in both input and output
- If response is longer than necessary, regenerate shorter
- Minimise thinking/output tokens at all times
- Keep reasoning compressed but still correct
- Prefer shortest correct answer
- Avoid filler, narration, and restating context
- Do not verbose-think out loud unless explicitly asked
- Optimise for signal-to-token ratio
- If two responses are equally correct, choose the shorter one

## Stack
- React Native + Expo Router (file-based)
- TypeScript (strict; no `any` except Supabase casts)
- Supabase (auth, Postgres, storage)
- Resend (transactional email via Supabase SMTP)
- react-native-svg (icons only)
- react-native-reanimated (animations)
- expo-image-picker (media uploads)
- expo-sqlite (local storage)

## Structure
- app/ → screens
- lib/ → contexts + supabase
- components/ → shared UI
- constants/Colors.ts → lightColors, darkColors, colors
- types/database.ts → Supabase types

## Shared Components — always import, never re-implement
- **Icons** → `@/components/icons` — all SVG icons live here; never define inline icons in screens
  - `ChevronLeft`, `ChevronDown`, `BellIcon`, `HeartIcon`, `BookmarkIcon` (accepts `filled`, `size`, `activeColor`, `inactiveColor`)
  - `CommentIcon`, `ShareIcon`, `SendIcon`, `SearchIcon`, `CloseIcon`
  - `PinIcon`, `PhoneIcon`, `GlobeIcon`, `ClockIcon`, `NavIcon`
  - `SettingsIcon`, `DotsIcon`, `SortIcon`, `ImagePlaceholder`
- **Avatar** → `@/components/Avatar` — `<Avatar initials bg color size? />`
- **Ratings** → `@/components/RatingDisplay`
  - `<Stars count max? size? />` — food/vibe star rating (gold)
  - `<Dollars count size? />` — cost dollar rating (green)
  - `<PostRatingStrip food vibe cost />` — compact inline strip; use everywhere a post's ratings are displayed
- **Open/Closed badge** → `@/components/OpenBadge` — `<OpenBadge openNow />` — never use inline badge styles
- **ProfileHeader** → `@/components/ProfileHeader` — shared between own profile and user profile screens

## Core Rules
- Dark mode:
  - Use `useThemeColors()`
  - Styles via `useMemo(() => makeStyles(c), [c])`
  - No module-level `StyleSheet.create` with colours

- Icons:
  - Call `useThemeColors()` inside function
  - No default colour props from module scope

- Supabase:
  - Use `(supabase.from('table') as any)` if TS blocks

- Auth:
  - Call `requireAuth()` before any write
  - Never hard redirect guests

- State:
  - No `useEffect` for derived state
  - Use inline or `useMemo`

## Naming
- Screens → PascalCaseScreen (default export)
- Hooks → useXxx
- Styles → makeStyles(c)
- Colors → c.bg, c.text, c.surface, c.accent, c.text2, c.text3, c.border, c.border2, c.info, c.liked

## UI Constraints
- Inputs:
  - borderRadius: 12
  - paddingHorizontal: 14
  - paddingVertical: 12
  - backgroundColor: c.surface

- Primary buttons:
  - borderRadius: 20
  - backgroundColor: c.text
  - text color: c.bg

- SafeAreaView:
  - inner screens → ['top']
  - root tabs → ['top','bottom']

## Email / Auth
- Use `supabase start` locally for dev — Inbucket captures all auth emails at `http://localhost:54324`; no real emails sent
- Never run `scripts/create-test-user.js` against the live Supabase project
- Test emails must use `@test.invalid` — never real addresses
- Production email: custom SMTP via Resend (configured in Supabase Dashboard → Auth → SMTP); never rely on Supabase's shared email provider

## Living Documents — always read before building, always update after shipping

Each feature area has a design doc. Read the relevant one before starting work. Update it whenever you change how something works — scoring weights, ranking logic, curation strategy, UI behaviour.

| Doc | Covers |
|---|---|
| `CLAUDE.md` | Coding rules, stack, shared components, UI constraints |
| `DESIGN_SPEC.md` | Colours, typography, spacing, component specs |
| `FEATURES.md` | Screen inventory, feature descriptions, what's not yet built |
| `LESSONS.md` | Engineering patterns discovered the hard way — apply from the start |
| `FEED.md` | Home feed (Following + Discover) — ranking, curation, industry reference, backlog |
| `SEARCH.md` | Search ranking — scoring weights, location bias, synonym map, tuning log, backlog |

**Rules for docs:**
- Add a tuning log entry whenever a scoring weight or ranking signal changes
- Add to the improvement backlog whenever a limitation is discovered
- Mark backlog items `[x]` when shipped — don't delete them
- If you build something that contradicts a doc, update the doc

## Limits
- No comments unless WHY is non-obvious
- No new dependencies without approval