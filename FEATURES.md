# forkyou — Feature Tracker

Track of all implemented screens, flows, and features. Update as new work is shipped.

---

## Screens

### Tab bar — `app/(tabs)/`

| Screen | File | Status |
|---|---|---|
| Feed | `app/(tabs)/feed.tsx` | ✅ Done |
| Search | `app/(tabs)/search.tsx` | ✅ Done |
| Create (post) | `app/(tabs)/post.tsx` | ✅ Done |
| Alerts | `app/(tabs)/alerts.tsx` | ✅ Done |
| Profile | `app/(tabs)/profile.tsx` | ✅ Done |

### Post detail — `app/post/`

| Screen | File | Status |
|---|---|---|
| Post detail | `app/post/[id].tsx` | ✅ Done |

### Auth — `app/(auth)/`

| Screen | File | Status |
|---|---|---|
| Welcome | `app/(auth)/welcome.tsx` | ✅ Done |
| Sign in | `app/(auth)/login.tsx` | ✅ Done |
| Sign up (step 1 — credentials) | `app/(auth)/signup.tsx` | ✅ Done |
| Sign up (step 2 — profile) | `app/(auth)/signup-profile.tsx` | ✅ Done |

### Settings — `app/settings/`

| Screen | File | Status |
|---|---|---|
| Settings hub | `app/settings/index.tsx` | ✅ Done |
| Edit profile | `app/settings/edit-profile.tsx` | ✅ Done |
| Change email | `app/settings/change-email.tsx` | ✅ Done |
| Change password | `app/settings/change-password.tsx` | ✅ Done |

---

## Features

### Feed
- Wordmark top bar with notification bell
- Following / Discover tab switcher (visual only — not yet data-backed)
- Two-column masonry grid of post cards
- Post card: coloured image placeholder, title (2-line clamp), avatar + like count
- Tap card → push to post detail

### Search
- Search input with clear button
- 7 category filter chips (horizontal scroll)
- Trending hashtag list (ranks 1-3 in accent, rest in text3)
- Live filtering across title, tags, creator, location, body

### Create (post)
- Photo upload area (dashed border 4:3 placeholder) / preview strip after selection
- Title input (max 100 chars, counter)
- Body / review input (multiline)
- Food rating (1–5 stars, gold)
- Vibe rating (1–5 stars, gold)
- Cost rating (1–4 dollar signs, green)
- Location picker (bottom sheet modal, searchable list of restaurants)
- Hashtag tokeniser (space/enter adds blue pill token)
- Auth gate on mount — guests are prompted before accessing

### Alerts
- Empty state with bell icon and copy
- Auth gate on mount — guests are prompted before accessing

### Profile
- Username top bar + settings gear (navigates to /settings)
- 72 px avatar circle with initials
- Stats row (Posts, Followers, Following)
- Bio and location tag
- Edit profile button (navigates to /settings/edit-profile)
- Share button (placeholder)
- 3 icon-only tabs: Posts grid, Saved grid, Liked grid
- 3-column thumbnail grid with colour placeholders
- Auth gate on mount — guests are prompted before accessing

### Post detail
- 4:3 photo area with dot pagination indicators
- Like / comment / save / share action bar
- Follow pill button
- Ratings chips (food stars, vibe stars, cost dollars)
- Hashtag pills
- Comment input + send button
- All interactive actions (like, save, follow, comment send) gated — guests shown auth prompt

### Auth flow
- Email + password sign-in
- Email + password sign-up (2 steps: credentials → profile)
- Google OAuth (WebBrowser + token extraction + setSession)
- Session persistence via Supabase (expo-sqlite/localStorage)
- Soft auth gate — guests browse freely, prompted on interaction
- `AuthContext` — user, session, loading; signIn/signUp/updateProfile/signInWithGoogle/signOut
- `AuthGateContext` — `requireAuth()` shows bottom sheet modal if not signed in
- `AuthPromptModal` — bottom sheet with "Join forkyou." CTA

### Settings
- Settings hub with sections: Account, Notifications, Privacy, Appearance, About, Danger zone
- Toggles persisted to `user_settings` Supabase table (upsert on change)
- Edit profile: avatar upload (expo-image-picker → Supabase Storage), username, display name, bio
- Change email: re-auth then `supabase.auth.updateUser({ email })`
- Change password: re-auth then `supabase.auth.updateUser({ password })`
- Sign out: confirmation alert → `supabase.auth.signOut()`
- Delete account: confirmation alert → contact support prompt

---

## Infrastructure

| Area | File(s) | Notes |
|---|---|---|
| Design tokens | `constants/Colors.ts` | `colors`, `imgColors` |
| Supabase client | `lib/supabase.ts` | Typed with `Database` |
| Database types | `types/database.ts` | All tables including `user_settings` |
| Mock data | `lib/data.ts` | 6 posts, 10 restaurants |
| Posts context | `lib/PostsContext.tsx` | In-memory; `addPost()` |
| Auth context | `lib/AuthContext.tsx` | Full Supabase auth |
| Auth gate context | `lib/AuthGateContext.tsx` | Soft gate + modal |
| Settings context | `lib/SettingsContext.tsx` | Loads/saves `user_settings` |
| Fonts | `assets/fonts/DMSerifDisplay-Regular.ttf` | Wordmark only |
| DB migration | `supabase/migrations/20240101000000_initial_schema.sql` | Full schema + RLS + storage |
| Tab bar | `app/(tabs)/_layout.tsx` | Custom SVG icons, no Ionicons |
| Custom post button | `components/TabBarPostButton.tsx` | Auth-gated + + button |
| Auth prompt modal | `components/AuthPromptModal.tsx` | Bottom sheet CTA |
| Root layout | `app/_layout.tsx` | Provider stack + font load |
| Settings layout | `app/settings/_layout.tsx` | Stack with no header |

---

## Not yet built

- Real backend data (feed, search, post detail all use mock data)
- Following / Discover feed split (UI tabs exist, not data-backed)
- Notifications (alerts screen is empty state only)
- Saved / Liked tabs in profile (uses mock post slice, not real saves/likes table)
- Share sheet
- Comment threads / replies
- Follow/unfollow real backend call
- Search — backend full-text search
- Forgot password flow
- Connected accounts management (Google disconnect)
- Push notifications
- Deep linking / universal links
