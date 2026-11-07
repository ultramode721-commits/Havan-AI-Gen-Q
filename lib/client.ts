let accessToken = "";
export function setAccessToken(token: string) {
  accessToken = token;
}
export async function api<T = any>(
  url: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body === undefined
      ? {}
      : { body: body instanceof FormData ? body : JSON.stringify(body) }),
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}
export function download(
  name: string,
  data: string,
  type = "application/json",
) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
// Browser-local record IDs only; server exam tickets use node:crypto independently.
export function newId() {
  if (typeof globalThis.crypto?.randomUUID === "function")
    return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues)
    return Array.from(
      globalThis.crypto.getRandomValues(new Uint8Array(16)),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("");
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
