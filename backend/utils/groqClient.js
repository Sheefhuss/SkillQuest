const Groq = require("groq-sdk");

const API_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean);

if (API_KEYS.length === 0) {
  throw new Error("No Groq API keys found. Set GROQ_API_KEY_1 through GROQ_API_KEY_5 in .env");
}

const keyStats = API_KEYS.map(() => ({
  requests: 0,
  resetAt: Date.now() + 60_000,
  cooldownUntil: 0,
}));

let currentIndex = 0;

function resetIfNeeded(stats) {
  if (Date.now() > stats.resetAt) {
    stats.requests = 0;
    stats.resetAt = Date.now() + 60_000;
  }
}

function getClient() {
  const now = Date.now();

  for (let i = 0; i < API_KEYS.length; i++) {
    const idx = (currentIndex + i) % API_KEYS.length;
    const stats = keyStats[idx];

    resetIfNeeded(stats);

    if (stats.cooldownUntil > now) continue;
    if (stats.requests >= 28) continue;

    stats.requests++;
    currentIndex = (idx + 1) % API_KEYS.length;
    return { client: new Groq({ apiKey: API_KEYS[idx] }), idx };
  }

  const soonest = keyStats.reduce((best, s, i) => {
    const wait = Math.max(s.cooldownUntil, s.resetAt);
    return wait < best.wait ? { wait, idx: i } : best;
  }, { wait: Infinity, idx: 0 });

  const waitSec = Math.ceil((soonest.wait - now) / 1000);
  const err = new Error(`All Groq keys rate limited. Retry in ${waitSec}s`);
  err.status = 429;
  err.retryAfter = waitSec;
  throw err;
}

function markRateLimited(idx, retryAfterSeconds = 60) {
  keyStats[idx].cooldownUntil = Date.now() + retryAfterSeconds * 1000;
  keyStats[idx].requests = 28;
}

async function groqChat(messages, options = {}) {
  const { client, idx } = getClient();

  try {
    const completion = await client.chat.completions.create({
      model: options.model || "llama-3.3-70b-versatile",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    if (err?.status === 429) {
      const retryAfter = parseInt(err?.headers?.["retry-after"] || "60");
      markRateLimited(idx, retryAfter);
      return groqChat(messages, options);
    }
    throw err;
  }
}

module.exports = { groqChat };
