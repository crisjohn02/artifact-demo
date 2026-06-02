# AI First Impression Auction — Deploy Guide

A live-room demo that shows how an AI confidently invents a "leadership profile"
from almost no information. A participant enters their name, title, company, and
~15 words about their leadership style. On the host's cue ("Gemma"), they reveal
a profile the AI asserts with total confidence — archetype, hidden risk, stress
flaw, and a five-year headline.

The audience does **not** need a Claude account. The AI call runs on the server
using *your* API key, which never reaches the browser.

## How it fits together
```
profile-demo/
├── index.html        ← the page the audience sees (served at /)
├── api/
│   └── profile.js    ← server function: calls Claude, hides your key
├── package.json      ← "type": "module" so the function loads as ESM
└── .gitignore
```

The page calls `/api/profile` (same origin). That function calls Claude with the
key from the `ANTHROPIC_API_KEY` environment variable and returns the profile.

## Deploy to Vercel (about 5 minutes)

1. Get an Anthropic API key at https://console.anthropic.com
   (Settings → API Keys → Create Key). Pay-as-you-go; this demo costs pennies.

2. Sign up at https://vercel.com (free). Either:
   - Push this folder to a GitHub repo and **Add New… → Project → Import**, or
   - **Add New… → Project → Deploy** and drag-and-drop this whole folder.

   No framework / build step is needed — Vercel serves `index.html` at the root
   and turns `api/profile.js` into a serverless function automatically.

3. Add the environment variable (during import, or under
   Project → Settings → Environment Variables afterwards):
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** (paste your key from step 1)

4. Deploy. Vercel gives you a public URL like
   `https://ai-profile-demo.vercel.app`.

5. Open it, run yourself through it once, then paste the URL into any QR-code
   generator for your slides.

## Run locally (optional)
```
npm i -g vercel
vercel dev          # runs the page + the /api function together
```
Set the key first: `vercel env add ANTHROPIC_API_KEY` (or create a `.env` /
`.env.local` with `ANTHROPIC_API_KEY=sk-ant-...`).

## Customising
- **Model** — `api/profile.js` defaults to `claude-haiku-4-5` (fast, cheap).
  Swap to `claude-sonnet-4-6` for richer profiles.
- **Logging to a sheet (optional)** — to capture each submission, deploy a
  Google Apps Script web app and paste its URL into `STORE_URL` at the top of
  the `<script>` in `index.html`. Leave it `""` to keep it phones-only.
- The participant-facing copy mentions a host named "Gemma" and a "hold until
  cued" reveal step — edit `index.html` if your run-of-show differs.
- Set a small monthly spend limit in the Anthropic console for peace of mind.

## A note on the data
Participants type real details about themselves and the page tells them their
responses are recorded for the session. Only collect this with their knowledge,
don't keep it longer than the event needs, and don't read the AI's "profile" as
anything more than the confident pattern-amplification the demo is designed to
expose.
