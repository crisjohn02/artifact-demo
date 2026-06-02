# AI Profile Demo — Deploy Guide

A small demo that shows how AI confidently invents details from almost no
information. A participant enters their name, role, and ~15 words about their
leadership style, and the Claude API generates a "profile" full of plausible
assumptions.

The audience does NOT need a Claude account — the AI call runs on the server
using your API key, which stays hidden.

## Folder structure
```
profile-demo/
├── api/
│   └── profile.js      ← server function (calls Claude, hides your key)
├── public/
│   └── index.html      ← the page the audience sees
└── package.json
```

## Deploy to Vercel (about 5 minutes)

1. Get an Anthropic API key at https://console.anthropic.com
   (Settings → API Keys → Create Key). Pay-as-you-go; this demo costs pennies.

2. Sign up at https://vercel.com (free). The easiest no-code route:
   - Click "Add New… → Project"
   - Choose "Deploy" and drag-and-drop this whole `profile-demo` folder,
     OR push the folder to a GitHub repo and import it.

3. BEFORE finishing deploy (or under Project → Settings → Environment
   Variables afterwards), add this variable:
   - Name:  ANTHROPIC_API_KEY
   - Value: (paste your key from step 1)

4. Deploy. Vercel gives you a public URL like
   https://ai-profile-demo.vercel.app

5. Test it yourself first. Then paste that URL into any free QR code
   generator for your slides.

## Notes
- If you change the API key, redeploy (or just save the env var and
  "Redeploy" from the Vercel dashboard).
- The `model` in api/profile.js is claude-sonnet-4. You can swap it for a
  newer model string if you like.
- Set a small spend limit in the Anthropic console for peace of mind.
