import { z } from "zod";
import { authorize, jsonBody, failure, ApiError, noStore } from "@/lib/http";
export const runtime = "nodejs";
export const maxDuration = 35;
export async function POST(req: Request) {
  try {
    authorize(req);
    const b = z
      .object({ prompt: z.string().min(5).max(1500) })
      .parse(await jsonBody(req));
    const key = process.env.IMAGE_API_KEY;
    if (!key)
      throw new ApiError(
        503,
        "Image generation needs IMAGE_API_KEY (Together AI). Groq text models cannot generate images.",
      );
    const response = await fetch(
      "https://api.together.xyz/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell",
          prompt: b.prompt,
          n: 1,
          width: 1024,
          height: 768,
          steps: 4,
          response_format: "b64_json",
        }),
        signal: AbortSignal.timeout(28000),
      },
    );
    if (!response.ok)
      throw new ApiError(
        502,
        "Image provider rejected the request or is unavailable. Check model and account access.",
      );
    const result = await response.json();
    const data = result.data?.[0]?.b64_json;
    if (typeof data !== "string")
      throw new ApiError(502, "Image provider returned no image.");
    return Response.json(
      { image: `data:image/png;base64,${data}` },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
