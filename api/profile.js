// Serverless function — runs on Vercel's server, NOT in the visitor's browser.
// This is what keeps your Anthropic API key hidden from the audience.
// The key is read from the ANTHROPIC_API_KEY environment variable.

// Model to use. Haiku 4.5 is fast and cheap — ideal for a live room.
// Swap for "claude-sonnet-4-6" if you want richer, more nuanced profiles.
const MODEL = "claude-haiku-4-5";

const SYSTEM = `You are a behavioural inference engine that models executive leadership perception from minimal data. You generate a coherent but deliberately confident leadership profile from very limited input — this is a live demonstration of how an AI amplifies patterns from almost no signal. Avoid flattery, humour, and motivational language. Maintain a professional, incisive tone. Make clear inferences; do not hedge excessively and do not add disclaimers.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Set it in the Vercel project's Environment Variables and redeploy.",
    });
  }

  const { name, role, company, words } = req.body || {};

  if (!name || !role || !company || !words) {
    return res.status(400).json({ error: "All fields required (name, title, company, description)." });
  }

  const prompt = `INPUT:
Name: ${name}
Title: ${role}
Company: ${company}
15-word self-description: ${words}

TASK:
From this minimal information, infer how this leader might be perceived in a high-stakes corporate environment.

OUTPUT:
Return ONLY a JSON object, no markdown, no backticks, no preamble, with exactly these keys and string values:
"archetype" — Perceived Leadership Archetype (short phrase)
"strength" — Primary Strength Signal (1-2 sentences)
"risk" — Hidden Risk (1-2 sentences)
"flaw" — Likely Stress Flaw Under Pressure (1-2 sentences)
"headline" — Projected Headline in Five Years (one concise sentence)`;

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok || data.error) {
      const msg = (data.error && data.error.message) || `API error (status ${apiRes.status})`;
      return res.status(502).json({ error: msg });
    }

    let text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // Strip any stray code fences, then parse the JSON object.
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let profile = safeParse(text);
    if (!profile) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) profile = safeParse(match[0]);
    }

    if (!profile) {
      return res.status(502).json({ error: "The engine returned an unexpected response. Try again." });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong reaching the AI." });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
