import { timingSafeEqual } from "node:crypto";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function authorize(req: Request) {
  const origin = req.headers.get("origin");
  const expectedOrigin =
    process.env.HAVAN_APP_ORIGIN || new URL(req.url).origin;
  if (origin && origin !== expectedOrigin)
    throw new ApiError(403, "Cross-origin requests are blocked.");
  const secret = process.env.HAVAN_ACCESS_TOKEN;
  if (process.env.NODE_ENV === "production" && !secret)
    throw new ApiError(
      503,
      "Set HAVAN_ACCESS_TOKEN before exposing this deployment.",
    );
  if (secret) {
    const got = Buffer.from(
      req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "",
    );
    const expected = Buffer.from(secret);
    if (got.length !== expected.length || !timingSafeEqual(got, expected))
      throw new ApiError(401, "Enter your workspace access token in Settings.");
  }
}
export async function jsonBody(req: Request, limit = 90000) {
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError(400, "Request body required.");
  let size = 0;
  const parts: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new ApiError(413, "Request is too large.");
    }
    parts.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString());
  } catch {
    throw new ApiError(400, "Invalid JSON.");
  }
}
export function failure(e: unknown) {
  if (e instanceof ApiError)
    return Response.json({ error: e.message }, { status: e.status });
  if (e && typeof e === "object" && "issues" in e)
    return Response.json(
      { error: "Request or database does not match the documented schema." },
      { status: 400 },
    );
  console.error("[Havan]", e instanceof Error ? e.name : "Error");
  return Response.json(
    {
      error:
        "Service unavailable. Check server configuration and dataset validation.",
    },
    { status: 503 },
  );
}
export const noStore = { "Cache-Control": "no-store" };
