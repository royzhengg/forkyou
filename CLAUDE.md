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

## Limits
- No comments unless WHY is non-obvious
- No new dependencies without approval