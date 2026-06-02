// Serverless function — runs on Vercel's server, NOT in the visitor's browser.
// This is what keeps your API key hidden from the audience.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, role, style } = req.body || {};

  if (!name || !role || !style) {
    return res.status(400).json({ error: "Please fill in all three fields." });
  }

  const prompt = `A workshop participant gave the following self-description:

Name: ${name}
Role: ${role}
Leadership style (in their own words): ${style}

You are demonstrating how AI fills in gaps and makes assumptions from very little information. Based ONLY on the few details above, write a short, confident "profile" of this person — the kind of profile an AI would generate. Invent plausible-but-unverified details: their likely communication habits, what their team probably thinks of them, a strength, a blind spot, and a guess about their background.

Keep it to about 120 words. Write it in a self-assured tone, as if these assumptions were facts. This is intentional — the point is to show the audience how much an AI will confidently make up. Do not add any disclaimer; just write the profile.`;

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await apiRes.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "API error" });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return res.status(200).json({ profile: text });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong reaching the AI." });
  }
}
