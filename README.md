# Universal Contact Launcher

A production-ready, mobile-first web app that lets anyone enter a country
calling code plus a username, account ID, or phone number, then launch a
contact on one of **seven** channels:

**Telegram · Instagram · WhatsApp · Signal · WeChat · Call · Internet Call**

The first six open the corresponding platform (or the phone dialer). The
seventh starts a real peer-to-peer **internet voice/video call** using WebRTC,
with optional video, between users of this app.

> Connect with anyone, anywhere.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React + Tailwind CSS |
| Phone validation | `libphonenumber-js` |
| Country data | `world-countries` (joined with `libphonenumber-js`) |
| Icons | `lucide-react` |
| Calling | WebRTC (peer-to-peer voice + video) |
| Signaling | WebSocket reference server (`server/`) |
| NAT traversal | STUN + configurable TURN |
| Deployment | Vercel (frontend) |

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev                  # http://localhost:3000
```

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests for validation & links |
| `npm run signaling` | Run the reference signaling server |

---

## Features

### 1. Full country calling-code selector
- **All 245 countries/territories** with calling codes - generated from
  `libphonenumber-js` and joined with `world-countries` for names, ISO codes,
  and flags. Nothing is hand-typed.
- Search by **country name**, **calling code**, or **ISO code** (diacritic
  insensitive).
- Displays flag, name, ISO code, and `+` calling code.
- Handles **shared calling codes** (e.g. `+1` -> US, CA, and all territories).
- Alphabetical sort, mobile-friendly dropdown, full keyboard support.
- **Ethiopia (+251)** is the initial country.
- Works **fully offline** - no remote API needed. Missing metadata degrades
  gracefully (fallback flag via regional indicators).

### 2. Phone-number validation
- National numbers use the selected country.
- Numbers starting with `+` (or `00`) are parsed as international.
- The selected calling code is **never appended twice**.
- E.164 formatting for `tel:` links; digits-only for `wa.me` and Signal.
- Clear, live feedback for invalid/incomplete input.
- **We never claim a number is registered** on any platform.

### 3. Main interface
- Title **Contact Launcher**, subtitle **Connect with anyone, anywhere.**
- Country selector, one shared input, and a **Phone / Username** mode switch.
- Seven buttons: six external platforms + the Internet Call button.
- Clear and Copy-contact actions.
- Responsive grid: **2 columns on mobile** (Internet Call spans full width),
  2-3 columns on tablet/desktop. Touch targets >= 48x48 px.
- Accessible labels, keyboard focus rings, `aria-live` validation feedback.
- No horizontal overflow. Light + dark themes (persisted, no flash).

### 4. Internet calling (WebRTC)
- Peer-to-peer audio, with an **optional video** toggle.
- Connects through the signaling server, exchanges offer/answer/ICE.
- STUN by default; **TURN** supported for restrictive networks.
- In-call controls: mute, hang up, toggle camera.
- Both peers use the same **room code** (the contact identifier); one should
  be the initiator (the app sends the offer by default).

---

## Running internet calls

WebRTC needs a signaling server to set up the call. A minimal reference
server is included:

```bash
npm install            # (ws is already a dependency)
npm run signaling      # listens on ws://localhost:8080
```

Then set in `.env.local`:

```
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:8080
```

Open the app in **two** browsers/devices, enter the **same** contact
identifier (phone number or username), and press **Internet Call** in both.
One side initiates; the other receives. See `server/README.md` for deployment
notes and TURN configuration.

> Vercel does not host WebSocket servers. Deploy the signaling server to
> Fly.io / Railway / Render / a VPS and point `NEXT_PUBLIC_SIGNALING_URL` at it
> (use `wss://` in production).

---

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add the environment variables from `.env.example` in the Vercel dashboard.
3. Deploy. The frontend builds as static output and works without the
   signaling server for all six messaging buttons; only Internet Call needs it.

---

## Security & privacy

- All external links open with `rel="noopener noreferrer"` via
  `window.open(..., "noopener,noreferrer")`.
- Usernames are URL-encoded before being placed in links (no URL injection).
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.mjs`.
- `poweredByHeader` disabled; TURN credentials are read from env, not source.
- No tracking and no registration on the main page. Google AdSense ads (when
  configured) are the only third-party script; see the Privacy Policy.

---
---

## Monetization (Google AdSense)

The site can show one responsive ad below the main Contact Launcher interface.
AdSense is **opt-in via configuration** - with no configuration, the app builds
and runs normally and shows **no ads at all**.

### What ships in the code

- `src/lib/ads.ts` - reads `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and
  `NEXT_PUBLIC_ADSENSE_HOME_SLOT`, validates their format, and exports
  `isAdsenseConfigured`. **No IDs are hard-coded.**
- `src/app/layout.tsx` - loads the official AdSense script **once**, on every
  page, **only when a valid publisher ID is configured** (this is also the tag
  Google uses to verify ownership).
- `src/components/AdUnit.tsx` - renders the official `<ins class="adsbygoogle">`
  unit once (no duplicate pushes), reserves space to avoid layout shift, fails
  silently under ad-blockers, and renders **nothing** when misconfigured. No
  fake ads are ever shown.
- One ad slot is placed below the controls and above the footer - never near
  call/mic/camera controls.

### Configure your real IDs

1. In Google AdSense, copy your **publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`) and
   create an ad unit to get its **data-ad-slot** (numeric).
2. Add to `.env.local` (and to Vercel -> Project -> Settings -> Environment
   Variables) - **never commit real values to a public repo**:

   ```
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   NEXT_PUBLIC_ADSENSE_HOME_SLOT=1234567890
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

3. Redeploy. The loader script and ad unit appear automatically.

### Verify and request review

1. Deploy with `NEXT_PUBLIC_SITE_URL` set to your live domain.
2. In AdSense -> **Sites**, add your domain and follow the verification steps
   Google shows. The loader script tag is already on the page when configured.
3. Ensure `ads.txt` is served at `https://your-domain.com/ads.txt` (AdSense
   provides the exact content; add it to `public/ads.txt` if you want it in
   this repo).
4. Publish the About / Contact / Privacy Policy / Terms pages (already included)
   and request review. Approval is granted by Google - this code does not
   guarantee approval or earnings.

### Consent (EEA / UK / Switzerland)

Google requires a consent signal for personalized ads in the EEA, UK, and
Switzerland. If you serve traffic there, use a Google-certified CMP (e.g.
Google's Funding Choices, or a certified provider) and wire it before the
AdSense script. The Privacy Policy links to Google's opt-outs; a certified CMP
integration is a **Needs Configuration** item that depends on your traffic and
regions.



## Project structure

```
src/
  app/
    layout.tsx          # Root layout, theme bootstrap, metadata
    page.tsx            # Home page
    globals.css         # Tailwind + base styles
    layout.tsx          # Root layout, theme bootstrap, AdSense loader, metadata
    page.tsx            # Home page
    robots.ts           # robots.txt (does not block AdSense/review crawlers)
    sitemap.ts          # sitemap.xml
    about/page.tsx      # About
    contact/page.tsx    # Contact
    privacy/page.tsx    # Privacy Policy
    terms/page.tsx      # Terms of Service
  components/
    ContactLauncher.tsx # Main interface + button logic + ad slot
    CountrySelector.tsx # Searchable country dropdown
    CallModal.tsx       # WebRTC call UI
    ThemeToggle.tsx     # Light/dark switch (useSyncExternalStore)
    AdUnit.tsx          # Reusable, opt-in AdSense unit
    PageShell.tsx       # Shared layout + footer for content pages
  data/
    countries.ts        # Country dataset builder (offline)
  lib/
    ads.ts              # AdSense config (env-driven, validated)
    validation.ts       # Phone parsing + link builders
    signaling.ts        # WebSocket signaling client
    webrtc.ts           # WebRTCCall engine
    ice.ts              # STUN/TURN configuration
    validation.test.ts  # Unit tests
server/
  signaling-server.mjs  # Reference WebSocket server
  README.md
public/
  manifest.webmanifest
  favicon.svg
```

---

## Testing

```bash
npm test        # 11 unit tests: validation, normalization, link builders
npm run typecheck
npm run lint
```

The unit tests cover: username validation, international vs. national parsing,
`00` normalization, no double calling codes, invalid/empty input, and correct
`t.me` / Instagram / `tel:` / `wa.me` / `signal.me` URL construction.
#   l a u n c h - c h a t  
 