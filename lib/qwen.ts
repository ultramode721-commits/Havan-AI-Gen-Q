import { ApiError } from "./http";

type Message = { role: "system" | "user" | "assistant"; content: string };

export async function completeQwen(
  messages: Message[],
  model: string,
  fetcher: typeof fetch = fetch,
) {
  const key = process.env.QWEN_API_KEY;
  const endpoint = process.env.QWEN_API_BASE_URL;
  if (!key || !endpoint)
    throw new ApiError(
      503,
      "Qwen is not configured. Set QWEN_API_KEY and QWEN_API_BASE_URL on the server.",
    );

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new ApiError(503, "Qwen endpoint configuration is invalid.");
  }
  if (
    url.protocol !== "https:" ||
    !url.pathname.endsWith("/chat/completions") ||
    !/^[a-zA-Z0-9._-]{1,100}$/.test(model)
  )
    throw new ApiError(503, "Qwen endpoint or model configuration is invalid.");

  const models = [model, process.env.QWEN_FALLBACK_MODEL].filter(
    (candidate, index, all): candidate is string =>
      !!candidate && all.indexOf(candidate) === index,
  );
  const deadline = Date.now() + 18000;
  for (const candidate of models) {
    try {
      const remaining = deadline - Date.now();
      if (remaining < 100) break;
      const response = await fetcher(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: candidate,
          messages,
          temperature: 0.2,
          max_tokens: 1400,
        }),
        signal: AbortSignal.timeout(Math.min(10000, remaining)),
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403)
          throw new ApiError(503, "Qwen credentials or model access are invalid.");
        if (![408, 429, 500, 502, 503, 504].includes(response.status))
          throw new ApiError(502, "Qwen rejected the request. Check the configured model.");
        continue;
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) continue;
      return { content, model: candidate };
    } catch (error) {
      if (error instanceof ApiError) throw error;
    }
  }
  throw new ApiError(
    503,
    "Qwen is temporarily unavailable or the request timed out. Please retry.",
  );
}

