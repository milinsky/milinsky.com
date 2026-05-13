# MILINSKY Landing — Easter Eggs Concept

## Philosophy

Easter eggs serve three purposes:

1. **Engagement** — visitors spend more time exploring, the site becomes memorable
2. **Signal** — demonstrates technical skill and creativity to potential clients
3. **Connection** — humor and hidden rewards create an emotional bond with the brand

Key principle: easter eggs should **change behavior or location** so they can't be trivially shared as "click here" instructions. Each visit should feel like a new exploration.

---

## Architecture

### EasterEggManager (single JS controller)

```
EasterEggManager {
    discovered: Set<string>       // tracks found eggs in localStorage
    visitCount: number            // visit counter in localStorage
    firstVisitDate: string        // ISO date of first visit
    lastActivity: timestamp       // for idle detection
    sessionSeed: number           // random per session for variation

    register(id, trigger, reward) // universal registration
    discover(id)                  // mark as found, save, check meta-achievement
    getVariant(id)                // returns random variant based on sessionSeed
    reset()                       // clear all progress
}
```

### Randomization Rules

- **Session seed**: `Math.random()` on load, stored in `sessionStorage`
- **Daily seed**: hash of `new Date().toDateString()`
- **Monthly rotation**: modulo on current month changes trigger locations
- Variant selection uses seeded random so behavior is consistent within a session but different between sessions

---

## Tier 1: Obvious & Delightful

Visitors stumble into these naturally. First contact with the "this site is alive" feeling.

### EE-01: Konami Boot Sequence

- **Trigger**: Konami code (↑↑↓↓←→←→BA) anywhere on page
- **Reward**: CRT "glitches" violently for 1s, then fake BIOS boot sequence in fullscreen overlay:
  ```
  MILINSKY BIOS v4.2.0
  Memory Test... 64MB OK
  Loading MILINSKY.OS...
  Kernel panic - not syncing: VFS: unable to mount root fs
  
  ...just kidding. You found me.
  
  Achievement unlocked: ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️
  ```
- **Variation**: Boot message changes daily (different "kernel panic" reasons, different jokes)
- **Difficulty**: Easy

### EE-02: Idle Terminal Ghost

- **Trigger**: No mouse/scroll/keyboard activity for 45-90s (randomized interval)
- **Reward**: A ghost cursor appears in a random terminal window and starts "typing" on its own. It browses fake files, reads `/etc/passwd`, finds `secrets.txt`, types "nah, I shouldn't... or should I?", then disappears
- **Variation**: Ghost picks a random terminal window each time, browses different fake files
- **Difficulty**: Easy (passive)

### EE-03: Logo Morph

- **Trigger**: Click the MILINSKY ASCII logo 7 times rapidly (< 500ms gaps)
- **Reward**: Logo dissolves into Matrix-style character rain for 2s, then reassembles as a different ASCII art piece. Rotates through: rocket ship, cat, PHP elephant, Duyler logo, retro computer
- **Difficulty**: Easy

### EE-04: CDE Right-Click Menu

- **Trigger**: Right-click anywhere on page (long-press on mobile)
- **Reward**: Custom CDE/Solaris-style dropdown replaces browser menu:
  ```
  ┌─────────────────────────────┐
  │ > About MILINSKY.OS         │
  │ > View Source (you know how)│
  │ > Print Resume              │
  │ > Enable Secret Theme       │
  │ > Contact — coming soon     │
  │ > Exit (nice try)           │
  └─────────────────────────────┘
  ```
  "Enable Secret Theme" activates a Cyberpunk/Neon color variant for the session. "Exit" shows "Nice try. There is no exit from MILINSKY.OS."
- **Variation**: Menu items shuffle order each session. Occasionally a new item appears: "Self-Destruct" (screen goes black for 2s, then back), "Coffee Break" (shows a ASCII coffee cup for 5s)
- **Difficulty**: Easy

### EE-05: Phosphor Trail

- **Trigger**: Move mouse around normally. After ~2000px cumulative distance, trail appears
- **Reward**: Faint cursor trail like CRT phosphor burn-in. After 5000px, random ASCII chars appear in trail. After 10000px, trail spells out a promo code or message
- **Variation**: The message at 10000px changes per session — different promo codes, jokes, or ASCII art
- **Difficulty**: Easy (passive)

---

## Tier 2: Curious & Clever

Requires poking around, trying things. Rewards curiosity and developer instincts.

### EE-06: Console Drop

- **Trigger**: Open browser DevTools console
- **Reward**: Styled `console.log` outputs:
  ```
  ╔═══════════════════════════════════════╗
  ║  Looking under the hood? Respect.     ║
  ║  Promo code: RETRO-DEV-2026           ║
  ║  20% off consulting.                  ║
  ╚═══════════════════════════════════════╝
  ```
  Followed by fake system logs:
  ```
  [kernel] MILINSKY.OS loaded
  [auth] visitor authenticated as curious_developer
  [notice] coffee levels: critical
  [warn] this developer seems cool — consider reaching out
  ```
- **Variation**: Fake log messages rotate daily
- **Difficulty**: Medium

### EE-07: The 404 Room

- **Trigger**: Navigate to any non-existent URL path (/secret, /admin, /wp-admin, etc.)
- **Reward**: Custom 404 page styled as "sector not found" error:
  ```
  ╔══════════════════════════════╗
  ║  SECTOR NOT FOUND            ║
  ║  Error 0x00000035            ║
  ║                              ║
  ║  The file you're looking for ║
  ║  has been moved to a BBS     ║
  ║  that no longer exists.      ║
  ║                              ║
  ║  ...but since you're here:   ║
  ║  Check the page source for   ║
  ║  another secret.             ║
  ╚══════════════════════════════╝
  ```
  ASCII art floppy disk "DATA NOT FOUND" above the text.
- **Variation**: Error code changes per URL attempted. Different ASCII art.
- **Difficulty**: Medium

### EE-08: Source Code Secret

- **Trigger**: View page source (Ctrl+U)
- **Reward**: Large HTML comment block visible only in source view:
  ```
  <!--
   ____  _     _ _   _ _____   ____ _  ______ _____
  |  _ \| |   | | \ | |  __ \ / __| |/ / ___|_   _|
  | |_) | |   | |  \| | |  | | |  | ' / (___  | |
  |  _ <| |___| | |\  | |  | | |__| . \___ \ | |
  |_| \_\_____|_|_| \_|_|  |_|\____|_|\_\____/ |_|
  
  You checked the source. Old school. Respect.
  
  Fun fact: This page has [X] easter eggs.
  You've found one. Keep looking.
  
  -->
  ```
- **Difficulty**: Medium

### EE-09: Terminal Command Parser

- **Trigger**: Click any terminal window to focus, type commands
- **Commands & Responses**:

  | Command | Response |
  |---------|----------|
  | `help` | Lists available commands with `secret` dimmed/strikethrough |
  | `sudo` | "Nice try. Root access requires solving a riddle." |
  | `sudo make me a sandwich` | "Okay." → ASCII sandwich with build log |
  | `exit` | Screen goes black. "Are you sure? [Y/N]" |
  | `whoami` | "visitor_${sessionId}" |
  | `ls` | Lists fake files: projects/, secrets.enc, todo.txt, coffee.md |
  | `cat coffee.md` | ASCII coffee cup + "Status: caffeine depleted. Please send more." |
  | `secret` | Password prompt (password rotates daily) |
  | `hello` | "Hi there! I'm not a chatbot. But I appreciate you trying." |
  | `rm -rf /` | "Nice try. This isn't that kind of terminal." |
  | `pineapple` | "Pineapple on pizza: a hill I'm willing to code on." |

- **Variation**: Daily password for `secret` is deterministic from date hash. Hints scattered as `data-hint` attributes across the site
- **Difficulty**: Medium

### EE-10: Theme Toggle Speedrun

- **Trigger**: Toggle dark/light theme 5 times in under 3 seconds
- **Reward**: Screen flashes, then re-renders in garish 90s GeoCities theme: tiled star background, Comic Sans, marquee tags, visitor counter, "under construction" CSS animation. Lasts 10s, then:
  ```
  SYSTEM RESTORED
  Sorry. I had a flashback to 1997.
  ```
- **Difficulty**: Medium

### EE-11: Select All Reveal

- **Trigger**: Ctrl+A (Select All) on the page
- **Reward**: Hidden transparent text between sections becomes visible via `::selection` styling. Forms a poem or message:
  ```
  You found the invisible text.
  In the early web, we hid messages in font color=background.
  Some things never change.
  Promo code: SELECT-ALL-2026
  ```
- **Difficulty**: Easy-Medium

### EE-12: Print Resume

- **Trigger**: Ctrl+P (Print the page)
- **Reward**: Print stylesheet renders the page as an actual formal resume/CV. Completely different layout. Footer reads: "This resume was printed from milinsky.dev. For the interactive experience, visit the URL."
- **Difficulty**: Medium

### EE-13: Drag Resistance

- **Trigger**: Try to drag any element on the page
- **Reward**: Element resists. CDE dialog appears:
  ```
  ┌──────────────────────────────────────────┐
  │ MILINSKY.OS — Error                       │
  ├──────────────────────────────────────────┤
  │ The user attempted to relocate            │
  │ a system resource.                        │
  │                                           │
  │ Error Code: 0xC0FFEE                      │
  │                                           │
  │ Did you want to:                          │
  │  [Contact Me]  [View Resume]  [Just Play] │
  └──────────────────────────────────────────┘
  ```
  "Just Playing Around" closes with "Carry on, troublemaker."
- **Difficulty**: Medium

---

## Tier 3: Hidden & Hardcore

Requires dev tools, specific knowledge, or patience. The ultimate flex.

### EE-14: The #bbs Portal

- **Trigger**: Add `#bbs` to URL
- **Reward**: Page transforms into full BBS interface with fake modem connection (Web Audio API generated dial tones → static → carrier). Shows BBS menu:
  ```
  CONNECTED TO MILINSKY BBS v2.1
  2400 baud — NO PARITY — 8 DATA BITS
  
  [1] Message Board
  [2] File Library  
  [3] SysOp Chat
  [4] Logout
  
  Selection> 
  ```
  Each option has content — message board has dev jokes, file library has downloadable ASCII art
- **Variation**: Baud rate shown is random each session (2400, 9600, 14400, 28800)
- **Difficulty**: Hard

### EE-15: The Time Traveler

- **Trigger**: System clock on specific dates
- **Reward**:
  - **Jan 1 1970**: "SYSTEM CLOCK RESET. ENTERING BIOS..." → fake BIOS screen
  - **Apr 1**: Everything is mirrored/backwards
  - **Oct 31**: Spooky theme (accent → orange, ASCII pumpkins)
  - **Dec 25**: ASCII snow, prompts say "HO HO HO >"
  - **Before 1990**: "TEMPORAL ANOMALY. This website does not exist yet."
- **Variation**: Active dates rotate monthly to prevent predictable triggering
- **Difficulty**: Hard

### EE-16: Visit Counter Persistence

- **Trigger**: Visit the page multiple times over days
- **Reward**: Terminal "remembers" you:
  - Visit 2: "Welcome back. I noticed you returned."
  - Visit 5: "Visit #5. You're becoming a regular."
  - Visit 10: "10 visits. Time we made this official." — unlocks hidden contact form
  - Visit 20+: "You've been here [X] times. Secret: [personal email/link]"
  - If localStorage cleared: "I had a feeling about you. You wiped your tracks. Respect."
- **Difficulty**: Medium-Hard (requires patience)

### EE-17: Network Tab Teapot

- **Trigger**: Open DevTools Network tab, find request to `/api/flag`
- **Reward**: Returns HTTP 418 (I'm a Teapot) with body:
  ```json
  {
    "status": "I'm a teapot",
    "message": "HTTP 418 was an April Fools joke in RFC 2324. You knowing that means we'd get along.",
    "promo": "TEAPOT-418-2026"
  }
  ```
  Also: `/robots.txt` lists `/secret`, `/admin`, `/toast` — visiting `/toast` shows ASCII toast
- **Difficulty**: Expert

### EE-18: Favicon Signal

- **Trigger**: Watch browser tab favicon over 5+ minutes
- **Reward**: Favicon changes every 30s, cycling through pixel patterns. After 5 minutes, the sequence encodes a binary message. Each favicon frame is a 16x16 canvas → PNG data URL
- **Variation**: Message direction reverses every other day
- **Difficulty**: Expert

### EE-19: Triple-Click Unredacted

- **Trigger**: Triple-click any section label (e.g., `> section_01 --about`)
- **Reward**: Section "expands" with hidden flags:
  ```
  > section_01 --about --verbose --unredacted
  ```
  Content temporarily shows "real talk" version — unfiltered, humorous. After 10s fades back:
  
  Polished: "Real commercial development experience across distributed systems."
  Unredacted: "I've been writing PHP since before it was cool. And after it stopped being cool. And right now while it's becoming cool again."
- **Variation**: Unredacted content rotates from a pool of variants
- **Difficulty**: Medium

### EE-20: The Scanline Cipher

- **Trigger**: Analyze the CRT scanline pattern (screenshot + decode or inspect CSS)
- **Reward**: The "scanlines" encode binary data via thickness variation (thin=0, thick=1). Decoding reveals a message: "You decoded the signal. Next frequency: [promo code]"
- **Difficulty**: Expert

### EE-21: Mobile Shake

- **Trigger**: Shake phone (accelerometer) while on page
- **Reward**: CRT "breaks" — screen shakes, scanlines distort, "signal lost" static for 2s, then "tunes back in" to hidden ASCII art gallery or motivational quote
- **Difficulty**: Easy (mobile-specific)

### EE-22: Overscroll Hidden Sector

- **Trigger**: Scroll to very bottom, keep scrolling (overscroll) 3 times
- **Reward**: Page "tears" — horizontal crack animation, hidden section slides up labeled `> sector_99 --classified`. Contains a mini ASCII pong game or hidden case study
- **Difficulty**: Medium-Hard

---

## Meta: The Achievement System

### EE-META: Easter Egg Hunter

- **Trigger**: Discover any 5 easter eggs
- **Reward**: Achievement notification: "ACHIEVEMENT UNLOCKED: Easter Egg Hunter". Hidden `#achievements` panel shows all discovered eggs with checkmarks. Finding ALL triggers:
  ```
  ╔════════════════════════════════════════════╗
  ║  ACHIEVEMENT: Completionist                 ║
  ║                                              ║
  ║  You found everything.                       ║
  ║  You're exactly the kind of person           ║
  ║  I want to work with. Let's talk.            ║
  ║                                              ║
  ║  [Direct contact link/email]                  ║
  ╚════════════════════════════════════════════╝
  ```
- **Implementation**: `localStorage` Set tracking discovered IDs. Check count after each `discover()` call. Achievement panel accessible via `#achievements` hash.

---

## Implementation Priority

### Phase 1 — Quick Wins (can implement immediately)

| ID | Effort | Impact |
|----|--------|--------|
| EE-06 Console Drop | Low | High (devs always check) |
| EE-08 Source Code | Low | Medium |
| EE-11 Select All | Low | Medium |
| EE-03 Logo Morph | Medium | High |
| EE-04 Right-Click Menu | Medium | High |

### Phase 2 — Core Interactive

| ID | Effort | Impact |
|----|--------|--------|
| EE-09 Terminal Commands | High | Very High (killer feature) |
| EE-01 Konami Boot | Medium | High |
| EE-02 Idle Ghost | Medium | High |
| EE-10 Theme Speedrun | Medium | High (viral potential) |
| EE-16 Visit Counter | Low | High (retention) |

### Phase 3 — Hardcore

| ID | Effort | Impact |
|----|--------|--------|
| EE-14 BBS Portal | Very High | Very High |
| EE-07 404 Room | Medium | High |
| EE-13 Drag Resistance | Medium | Medium |
| EE-12 Print Resume | Medium | Medium |
| EE-19 Triple-Click | Low | Medium |

### Phase 4 — Expert Level

| ID | Effort | Impact |
|----|--------|--------|
| EE-17 Network Teapot | Medium | Low (very few will find) |
| EE-18 Favicon Signal | High | Low (very few will find) |
| EE-20 Scanline Cipher | Very High | Low (very few will find) |
| EE-15 Time Traveler | Medium | Medium (seasonal) |
| EE-22 Overscroll Sector | High | Medium |

### Phase 5 — Meta

| ID | Effort | Impact |
|----|--------|--------|
| EE-META Achievement | Medium | Very High (ties everything together) |
| EE-05 Phosphor Trail | Medium | Medium |
| EE-21 Mobile Shake | Low | Medium (mobile-only) |

---

## Promo Codes Strategy

Easter eggs that give promo codes should use **session-specific codes** to prevent easy sharing:

- Codes are generated from: `BASE_PREFIX + hash(sessionDate + secretSalt)`
- Each code is valid conceptually (real usage requires backend validation later)
- Example codes for demo: `RETRO-DEV-2026`, `SELECT-ALL-2026`, `TEAPOT-418-2026`
- When backend exists, codes map to actual discounts on consulting

---

## Design Principles

1. **Never break the professional feel** — easter eggs are delightful surprises, not gimmicks that undermine credibility
2. **Respect both themes** — every easter egg must work in dark and light Solarized
3. **Mobile parity** — every desktop easter egg has a mobile equivalent or is replaced by EE-21 (Shake)
4. **No external dependencies** — all effects use vanilla JS, Web Audio API, Canvas API
5. **prefers-reduced-motion** — easter eggs that are purely visual/animations are disabled; text-based rewards still work
6. **Variable location** — key easter eggs randomize their trigger point per session/day so walkthroughs become stale quickly
