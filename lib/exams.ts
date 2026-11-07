import {
  createHmac,
  timingSafeEqual,
  randomBytes,
  randomInt,
} from "node:crypto";
import { ApiError } from "./http";
import type { Question } from "./schema";
const devSecret = randomBytes(32).toString("hex");
function secret() {
  if (process.env.EXAM_SIGNING_SECRET) return process.env.EXAM_SIGNING_SECRET;
  if (process.env.NODE_ENV === "production")
    throw new ApiError(503, "Set EXAM_SIGNING_SECRET before starting exams.");
  return devSecret;
}
export function shuffled<T>(input: T[]) {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function signExam(ids: string[], seconds: number) {
  const payload = Buffer.from(
    JSON.stringify({
      ids,
      start: Date.now(),
      end: Date.now() + seconds * 1000,
      nonce: randomBytes(12).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}
export function verifyExam(token: string) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) throw new ApiError(400, "Invalid exam ticket.");
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected))
    throw new ApiError(400, "Exam ticket was modified.");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    ids: string[];
    start: number;
    end: number;
  };
  if (Date.now() > data.end + 30000)
    throw new ApiError(
      410,
      "Exam submission window expired. Start a new practice session.",
    );
  return data;
}
export function grade(questions: Question[], answers: Record<string, number>) {
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const domains = Object.fromEntries(
    [...new Set(questions.map((q) => q.domain))].map((d) => {
      const qs = questions.filter((q) => q.domain === d);
      return [
        d,
        {
          correct: qs.filter((q) => answers[q.id] === q.answer).length,
          total: qs.length,
        },
      ];
    }),
  );
  return {
    correct,
    total: questions.length,
    percentage: Math.round((100 * correct) / questions.length),
    domains,
    review: questions.map((q) => ({ ...q, selected: answers[q.id] ?? null })),
    prediction: null,
    notice:
      "Practice performance only. No calibrated probability of passing an official UAT is available.",
  };
}
