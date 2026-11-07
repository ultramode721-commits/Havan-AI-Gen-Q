import { ApiError } from "./http";
type Message = { role: "system" | "user" | "assistant"; content: string };
export async function complete(
  messages: Message[],
  fetcher: typeof fetch = fetch,
  primaryModel?: string,
) {
  const key = process.env.GROQ_API_KEY;
  if (!key)
    throw new ApiError(
      503,
      "Groq is not configured. Set GROQ_API_KEY on the server.",
    );
  const models = [
    primaryModel || process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    process.env.GROQ_FALLBACK_MODEL,
  ].filter((m): m is string => !!m);
  const deadline = Date.now() + 18000;
  for (let i = 0; i < models.length; i++) {
    try {
      const remaining = deadline - Date.now();
      if (remaining < 100) break;
      const response = await fetcher(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: models[i],
            messages,
            temperature: 0,
            max_tokens: 1400,
          }),
          signal: AbortSignal.timeout(Math.min(10000, remaining)),
        },
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403)
          throw new ApiError(
            503,
            "Groq credentials or model access are invalid.",
          );
        if (![408, 429, 500, 502, 503, 504].includes(response.status))
          throw new ApiError(
            502,
            "Groq rejected the request. Check the configured model.",
          );
        continue;
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) continue;
      return { content, model: models[i] };
    } catch (e) {
      if (e instanceof ApiError)
        throw e; /* DNS, timeout and dropped connection: bounded same-provider fallback only. */
    }
  }
  throw new ApiError(
    503,
    "Groq is temporarily unavailable or the network timed out. Please retry.",
  );
}

