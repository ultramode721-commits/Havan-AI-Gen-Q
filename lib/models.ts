import { ApiError } from "./http";
import { complete } from "./groq";
import { completeQwen } from "./qwen";

export const HAVAN_MODEL_IDS = ["havan-pro", "havan-sol", "havan-jarvis"] as const;
export type HavanModelId = (typeof HAVAN_MODEL_IDS)[number];
type Message = { role: "system" | "user" | "assistant"; content: string };

function qwenConfigured() {
  if (!process.env.QWEN_API_KEY || !process.env.QWEN_API_BASE_URL) return false;
  try {
    const url = new URL(process.env.QWEN_API_BASE_URL);
    return url.protocol === "https:" && url.pathname.endsWith("/chat/completions");
  } catch {
    return false;
  }
}

export type RoutedModel = {
  id: HavanModelId;
  label: string;
  provider: "Groq" | "Qwen";
  providerModel: string;
};
const descriptors = {
  "havan-pro": {
    label: "Havan Pro",
    provider: "Groq" as const,
    model: () =>
      process.env.HAVAN_PRO_GROQ_MODEL ||
      process.env.GROQ_MODEL ||
      "llama-3.3-70b-versatile",
    configured: () => Boolean(process.env.GROQ_API_KEY),
  },
  "havan-sol": {
    label: "Havan 2.5 Sol",
    provider: "Qwen" as const,
    model: () => process.env.HAVAN_SOL_QWEN_MODEL || "qwen-plus",
    configured: qwenConfigured,
  },
  "havan-jarvis": {
    label: "Havan-3 Jarvis",
    provider: "Qwen" as const,
    model: () => process.env.HAVAN_JARVIS_QWEN_MODEL || "qwen-max",
    configured: qwenConfigured,
  },
} satisfies Record<
  HavanModelId,
  {
    label: string;
    provider: RoutedModel["provider"];
    model: () => string;
    configured: () => boolean;
  }
>;

export function modelCatalog() {
  return HAVAN_MODEL_IDS.map((id) => ({
    id,
    label: descriptors[id].label,
    provider: descriptors[id].provider,
    providerModel: descriptors[id].model(),
    available: descriptors[id].configured(),
  }));
}

export async function completeWithHavanModel(
  id: HavanModelId,
  messages: Message[],
  fetcher: typeof fetch = fetch,
) {
  const entry = modelCatalog().find((item) => item.id === id)!;
  if (!entry.available)
    throw new ApiError(
      503,
      `${entry.label} is not connected. Configure its ${entry.provider} server credentials to use it.`,
    );

  const result =
    id === "havan-pro"
      ? await complete(messages, fetcher, entry.providerModel)
      : await completeQwen(messages, entry.providerModel, fetcher);
  const model: RoutedModel = {
    id: entry.id,
    label: entry.label,
    provider: entry.provider,
    providerModel: result.model,
  };
  return { content: result.content, model };
}

export const HAVAN_MODEL_INSTRUCTIONS: Record<HavanModelId, string> = {
  "havan-pro":
    "Teach step by step with clear reasoning, concise examples, and useful follow-up questions. State uncertainty. Live web search, voice, and image understanding are unavailable unless the app explicitly supplies those tools.",
  "havan-sol":
    "Use a visual-learning teaching style: explain one step at a time, format equations for KaTeX, and offer a short self-check question when useful. This chat currently renders text and KaTeX only; do not claim to create interactive diagrams, quizzes, or sourced web images.",
  "havan-jarvis":
    "Use a careful scientific-research style. State assumptions, units, equations, and uncertainty. Do not fabricate computation, simulation, citations, or experimental results; only report calculations actually performed by the app.",
};

