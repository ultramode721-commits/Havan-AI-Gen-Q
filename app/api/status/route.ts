import { database } from "@/lib/database";
import { authorize, failure, noStore } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(req: Request) {
  try {
    authorize(req);
    const d = database();
    return Response.json(
      {
        chunks: d.chunks.length,
        questions: d.questions.length,
        issues: d.issues,
        demo: d.demo,
        chatConfigured: !!process.env.GROQ_API_KEY,
        imageConfigured: !!process.env.IMAGE_API_KEY,
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        files: ["PDF (text layer)", "DOCX", "TXT", "MD", "JSON"],
        unsupported: [
          "Scanned PDF OCR",
          "Image understanding",
          "Legacy DOC",
          "Arbitrary file formats",
        ],
        languages: ["English", "Amharic", "Afaan Oromo", "Tigrinya"],
        notice: "Language quality varies by model and task.",
      },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
