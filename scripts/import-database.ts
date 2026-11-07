/** Build-time import only. Never executes uploaded code or guesses missing answers. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { ChunkSchema, QuestionSchema } from "../lib/schema";
const folder = process.argv[2];
const output = process.argv[3] || "data/v3_qa_bank.json";
if (!folder)
  throw new Error(
    "Usage: node --import tsx scripts/import-database.ts <folder> [output.json]",
  );
function files(p: string): string[] {
  return readdirSync(p, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(path.join(p, e.name))
      : e.name.endsWith(".json")
        ? [path.join(p, e.name)]
        : [],
  );
}
const chunks = [];
const questions = [];
for (const f of files(path.resolve(folder))) {
  const d = JSON.parse(readFileSync(f, "utf8"));
  if (
    d.schemaVersion !== 1 ||
    !Array.isArray(d.chunks) ||
    !Array.isArray(d.questions)
  )
    throw new Error(
      `${f}: expected canonical schemaVersion 1. See docs/DATA_SCHEMA.md; four-option legacy rows cannot be padded automatically.`,
    );
  chunks.push(...d.chunks.map((r: unknown) => ChunkSchema.parse(r)));
  questions.push(...d.questions.map((r: unknown) => QuestionSchema.parse(r)));
}
for (const rows of [chunks, questions]) {
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.id)) throw new Error(`Duplicate id ${r.id}`);
    seen.add(r.id);
  }
}
writeFileSync(
  output,
  JSON.stringify({ schemaVersion: 1, chunks, questions }, null, 2) + "\n",
);
console.log(
  `Imported ${chunks.length} chunks and ${questions.length} questions. Run npm run validate-data to check cross-file collisions.`,
);
