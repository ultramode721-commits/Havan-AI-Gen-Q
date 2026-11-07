import { authorize, failure, ApiError, noStore } from "@/lib/http";
export const runtime = "nodejs";
export const maxDuration = 25;
export async function POST(req: Request) {
  try {
    authorize(req);
    const reader = req.body?.getReader();
    if (!reader) throw new ApiError(400, "File required.");
    let size = 0;
    const parts: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 6 * 1024 * 1024) {
        await reader.cancel();
        throw new ApiError(413, "Maximum request size is 6 MB.");
      }
      parts.push(value);
    }
    const raw = Buffer.concat(parts);
    const form = await new Request(req.url, {
      method: "POST",
      headers: { "content-type": req.headers.get("content-type") || "" },
      body: raw,
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "Choose a file.");
    if (file.size > 5 * 1024 * 1024)
      throw new ApiError(413, "Maximum file size is 5 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").at(-1)?.toLowerCase();
    let text = "";
    if (["txt", "md", "json", "csv"].includes(ext || "")) {
      text = bytes.toString("utf8");
      if (ext === "json") JSON.parse(text);
    } else if (ext === "docx") {
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer: bytes })).value;
    } else if (ext === "pdf") {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const task = pdfjs.getDocument({
        data: new Uint8Array(bytes),
        useSystemFonts: true,
      });
      const doc = await task.promise;
      try {
        if (doc.numPages > 100)
          throw new ApiError(
            422,
            "Maximum 100 PDF pages. Split this document first.",
          );
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text +=
            `\n[Page ${i}] ` +
            content.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" ");
          if (text.length > 100000) break;
        }
      } finally {
        await doc.destroy();
      }
    } else
      throw new ApiError(
        415,
        "Supported: text PDF, DOCX, TXT, MD, JSON, CSV. Images and scanned PDFs require an OCR/vision provider, which is not configured.",
      );
    if (text.trim().length < 10)
      throw new ApiError(
        422,
        "No usable text found. Scanned documents require OCR.",
      );
    return Response.json(
      {
        name: file.name,
        text: text.slice(0, 18000),
        truncated: text.length > 18000,
        notice:
          "Session reference only. Extraction may lose layout. Not added to the trusted UAT database or used for model training.",
      },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
