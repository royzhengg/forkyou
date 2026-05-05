# forkyou. — Design Spec for Claude Code

This file defines the design system, component patterns, and screen specifications for the forkyou app.
Reference this file when building any screen or component.

---

## Colours

```javascript
// Use these exact values throughout the app
export const colors = {
  bg: '#FAFAF8',          // Main background
  surface: '#F2F2EF',     // Card backgrounds, input fields
  surface2: '#E8E8E4',    // Secondary surfaces, borders
  border: 'rgba(0,0,0,0.08)',   // Subtle borders
  border2: 'rgba(0,0,0,0.14)',  // More visible borders

  text: '#1A1A18',        // Primary text
  text2: '#6B6B66',       // Secondary text
  text3: '#A8A8A2',       // Placeholder / tertiary text

  accent: '#D4522A',      // Brand accent (wordmark dot, trending ranks)
  info: '#2A6DD4',        // Hashtags, links, info states
  success: '#1D9E75',     // Cost dollar signs (green)
  warning: '#EF9F27',     // Star ratings (amber)
  liked: '#E24B4A',       // Liked heart (red)
}
```

---

## Typography

- **Font:** System font (San Francisco on iOS, Roboto on Android)
- **Wordmark only:** DM Serif Display (import via Google Fonts or use expo-google-fonts)

```javascript
// Font sizes
const typography = {
  xs: 10,       // Timestamps, secondary meta
  sm: 11,       // Hashtags, badges, labels
  base: 12,     // Comments, captions, small body
  md: 13,       // Body text, descriptions
  lg: 14,       // Back buttons, secondary headings
  xl: 15,       // Screen titles, post titles
  xxl: 16,      // Create screen title input
  wordmark: 22, // App name (DM Serif Display)
}
```

---

## Spacing & Layout

- Screen horizontal padding: **16px**
- Card border radius: **12px**
- Small border radius (chips, inputs): **8px**
- Status bar height: handled by SafeAreaView
- Top bar height: **56px**
- Bottom nav height: **72px**
- Feed grid gap: **6px**
- Feed grid padding: **8px**

---

## Bottom Navigation

Five tabs in this exact order:
1. **Feed** — home icon
2. **Search** — magnifying glass icon
3. **Post** (centre) — plus icon inside a 42×42 rounded rectangle (bg: text colour, icon: bg colour)
4. **Alerts** — bell icon
5. **Profile** — person icon

Active tab: icon and label use `text` colour
Inactive tab: icon and label use `text3` colour
The Post button has no label underneath it.

---

## Feed Screen

- Two-column masonry grid (cards can be different heights)
- Two tabs at top: **Following** (chronological) and **Discover** (algorithmic)
- Each post card contains:
  - Photo placeholder (3:4 ratio for standard, 3:5 for tall cards)
  - Post title — 2 lines max, font size 11.5, color: text
  - Creator avatar (16×16 circle with initials) + username
  - Like count with small heart icon
  - Card border radius: 10px
  - Card background: surface
  - Card border: 0.5px border

---

## Full Post View

Layout from top to bottom:
1. Back button bar (56px height) with "Back" text and chevron left, three-dot menu on right
2. Photo area — 4:3 aspect ratio, full width, dot indicators for multiple photos
3. Actions bar — like (heart), comment (speech bubble), save (bookmark), share (nodes) on left; Follow pill button on right
4. Scrollable content:
   - Creator avatar (32px) + handle + timestamp
   - Post title (15px, weight 500)
   - Body text (13px, color: text2, line height 1.65)
   - Ratings row — three chips side by side: Food (stars ★), Vibe (stars ★), Cost (dollar signs $)
     - Stars: filled = #EF9F27, empty = surface2
     - Dollar signs: filled = #1D9E75, empty = surface2
     - 5 stars max for Food and Vibe, 4 dollar signs max for Cost
   - Location pill — pin icon + restaurant name, tappable
   - Hashtags — color: info (#2A6DD4)
5. Comments section
6. Comment input bar pinned to bottom

**Social action states:**
- Liked: heart filled red (#E24B4A)
- Saved: bookmark filled text colour
- Following: pill background surface, text text2

---

## Search Screen

**Default state (no query):**
- Search bar at top (inside surface background, 12px border radius)
- Horizontal scrollable category chips below search bar
  - Active chip: background text, color bg
  - Inactive chip: background surface, color text2
- "Trending now" section with numbered list (1-3 in accent colour, rest in text3)

**Results state:**
- Results label: "X posts for [query]"
- Same two-column grid as feed
- Empty state if no results

Live search as user types — results update instantly.

**Category chips (in order):**
🍜 Ramen, ☀️ Brunch, 🥟 Dumplings, 🌙 Date night, 💸 Cheap eats, 🍣 Japanese, 🍔 Burgers

---

## Create Review Screen

One scrollable screen — no steps or multi-page flow.

Top bar: Cancel button (left), "New review" title (centre), Post button (right, disabled until title has 3+ chars)

Sections in order:
1. **Photo upload area** — dashed border, 4:3 ratio, tap to open image picker. After adding photos: show thumbnail strip with remove buttons and an add-more button.
2. **Title input** — large text input (16px, weight 500), placeholder "Give your review a title…", 100 char limit with counter
3. **Divider**
4. **Body input** — multiline text area (13px), placeholder describing the experience
5. **Divider**
6. **Ratings row** — three chips side by side:
   - Food: 5 tappable stars (tap to fill up to that star)
   - Vibe: 5 tappable stars
   - Cost: 4 tappable dollar signs
7. **Location input** — tap to open bottom sheet modal with search. Shows "Add location (optional)". Once selected shows restaurant name with pin icon and a clear button.
8. **Hashtag input** — type tag + press space/enter to add as a blue pill token. Tap × on token to remove.

**Location modal:**
- Bottom sheet that slides up
- Search field to filter restaurants
- List of results — tap to select and dismiss modal
- Data source: restaurants table in Supabase

---

## Profile Screen

**Top bar:** @username (centre), Settings icon (right)

**Header section:**
- Avatar: 72×72 circle with initials
- Stats row: Posts / Followers / Following (numbers tappable)
- Display name (14px, weight 500)
- Bio text (12px, color text2)
- Location tag with pin icon (11px, color text3)
- Action buttons: Edit profile (flex 1) + Share button with share icon

**Three tabs (icon only, no labels):**
- Grid icon → Posts tab: 3-column photo grid, square thumbnails
- Bookmark icon → Saved tab: same 3-column grid
- Heart icon → Liked tab: same 3-column grid
- Empty state for each tab if no content

**Other user's profile** (when viewing someone else):
- Same layout but Edit/Share replaced with Follow button + Message button
- No Saved or Liked tabs (private) — only Posts tab

---

## Non-user / Shared Link View

When a non-logged-in user opens a shared post link:
- Show full post content (photos, title, body, ratings, location, hashtags)
- Show creator profile — allow browsing their other posts
- Show restaurant reviews as teaser only (2-3 visible, rest blurred with sign-up prompt)
- Block: likes, saves, comments, follow, search, discovery feed
- Show sign-up prompt when user tries to interact: "Join forkyou to like, save and discover more"

---

## Key UX Patterns

- **Navigation:** Stack navigation for post view (push/pop). Tab navigation for main screens.
- **Back navigation:** Post view opened from profile returns to profile, from feed returns to feed, from search returns to search.
- **Loading states:** Use skeleton placeholders (surface2 background, animated shimmer) not spinners.
- **Error states:** Toast notification at bottom of screen, auto-dismisses after 3 seconds.
- **Empty states:** Icon + two lines of text, centred, generous padding.
- **Haptics:** Light haptic on like, save. Medium haptic on post submit.
