import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  ChunkSchema,
  QuestionSchema,
  type Chunk,
  type Question,
} from "./schema";
const names = [
  "v1_indexed_modules.json",
  "v2_knowledge_graph.json",
  "v3_qa_bank.json",
  "v4_logic_reasoning.json",
];
const stop = new Set([
  "the",
  "what",
  "is",
  "of",
  "and",
  "a",
  "an",
  "to",
  "in",
  "explain",
  "please",
  "how",
  "does",
  "for",
  "me",
  "can",
  "you",
]);
export function tokenize(s: string) {
  return (
    s
      .normalize("NFKC")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((t) => t.length > 1 && !stop.has(t)) ?? []
  );
}
function load() {
  const chunks: Chunk[] = [];
  const questions: Question[] = [];
  const issues: string[] = [];
  for (const name of names) {
    const p = path.join(process.cwd(), "data", name);
    if (!existsSync(p)) {
      issues.push(`${name}: missing`);
      continue;
    }
    const raw = JSON.parse(readFileSync(p, "utf8"));
    if (
      raw.schemaVersion !== 1 ||
      !Array.isArray(raw.chunks) ||
      !Array.isArray(raw.questions)
    )
      throw new Error(
        `${name}: expected schemaVersion:1, chunks[], questions[]`,
      );
    for (const c of raw.chunks) chunks.push(ChunkSchema.parse(c));
    for (const q of raw.questions) questions.push(QuestionSchema.parse(q));
  }
  if (process.env.ENABLE_DEMO_DATA === "true") {
    const raw = JSON.parse(
      readFileSync(path.join(process.cwd(), "data/demo.json"), "utf8"),
    );
    chunks.push(...raw.chunks.map((c: unknown) => ChunkSchema.parse(c)));
    questions.push(
      ...raw.questions.map((q: unknown) => QuestionSchema.parse(q)),
    );
  }
  for (const list of [chunks, questions]) {
    const seen = new Set<string>();
    for (const row of list) {
      if (seen.has(row.id)) throw new Error(`Duplicate id ${row.id}`);
      seen.add(row.id);
    }
  }
  const index = new Map<string, Set<number>>();
  const lengths: number[] = [];
  chunks.forEach((c, i) => {
    const words = tokenize(c.title + " " + c.text + " " + c.tags.join(" "));
    lengths[i] = words.length;
    for (const term of new Set(words)) {
      if (!index.has(term)) index.set(term, new Set());
      index.get(term)!.add(i);
    }
  });
  return {
    chunks,
    questions,
    issues,
    demo: process.env.ENABLE_DEMO_DATA === "true",
    index,
    lengths,
  };
}
let cached: ReturnType<typeof load> | undefined;
export function database() {
  return (cached ??= load());
}
export function retrieve(
  query: string,
  scope: "all" | "uat" = "all",
  budget = 6500,
) {
  const db = database();
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  const scores = new Map<number, { score: number; matches: number }>();
  for (const term of terms) {
    const ids = db.index.get(term);
    if (!ids) continue;
    const weight = Math.log(1 + (db.chunks.length + 1) / (ids.size + 1));
    for (const i of ids) {
      const prior = scores.get(i) || { score: 0, matches: 0 };
      scores.set(i, {
        score: prior.score + weight,
        matches: prior.matches + 1,
      });
    }
  }
  const ranked = [...scores]
    .filter(
      ([i, v]) =>
        v.matches >= Math.min(2, terms.length) &&
        v.matches / terms.length >= 0.25 &&
        (scope === "all" ||
          ["uat", "trained"].includes(db.chunks[i].repository)),
    )
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 5);
  let used = 0;
  return ranked.flatMap(([i]) => {
    const c = db.chunks[i];
    const text = c.text.slice(0, Math.min(1800, Math.max(0, budget - used)));
    used += text.length;
    return text ? [{ ...c, text }] : [];
  });
}
