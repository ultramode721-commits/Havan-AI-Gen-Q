import { z } from "zod";
import { database } from "@/lib/database";
import { authorize, jsonBody, failure, noStore, ApiError } from "@/lib/http";
import { verifyExam, grade } from "@/lib/exams";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    authorize(req);
    const b = z
      .object({
        token: z.string().max(30000),
        answers: z.record(z.string(), z.number().int().min(0).max(4)),
      })
      .parse(await jsonBody(req));
    const ticket = verifyExam(b.token);
    if (Object.keys(b.answers).some((id) => !ticket.ids.includes(id)))
      throw new ApiError(400, "Answer does not belong to this exam.");
    const questions = ticket.ids.map((id) =>
      database().questions.find((q) => q.id === id),
    );
    if (questions.some((q) => !q))
      throw new ApiError(409, "Question bank changed. Start a new exam.");
    return Response.json(
      grade(
        questions.filter((q) => !!q),
        b.answers,
      ),
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
