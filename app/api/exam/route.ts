import { z } from "zod";
import { database } from "@/lib/database";
import { authorize, jsonBody, failure, noStore, ApiError } from "@/lib/http";
import { shuffled, signExam } from "@/lib/exams";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    authorize(req);
    const b = z
      .object({
        subject: z.enum(["English", "Mathematics", "Both"]).default("Both"),
        count: z.number().int().min(1).max(100).default(10),
        minutes: z.number().int().min(1).max(180).default(15),
      })
      .parse(await jsonBody(req));
    const db = database();
    const bank = db.questions.filter(
      (q) =>
        ["uat", "trained"].includes(q.repository) &&
        (b.subject === "Both" || q.subject === b.subject),
    );
    if (!bank.length)
      throw new ApiError(
        422,
        "No valid five-choice UAT questions installed. Import your database or enable labeled demo data.",
      );
    const selected = shuffled(bank).slice(0, b.count);
    const seconds = b.minutes * 60;
    return Response.json(
      {
        token: signExam(
          selected.map((q) => q.id),
          seconds,
        ),
        endsAt: Date.now() + seconds * 1000,
        requested: b.count,
        available: bank.length,
        demo: db.demo,
        questions: selected.map(({ answer, explanation, ...q }) => q),
      },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
