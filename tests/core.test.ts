import test from "node:test";
import assert from "node:assert/strict";
import { QuestionSchema } from "../lib/schema";
import { database, retrieve, tokenize } from "../lib/database";
import { signExam, verifyExam, grade, shuffled } from "../lib/exams";
import { complete } from "../lib/groq";
import { POST as chat } from "../app/api/chat/route";
import { POST as exam } from "../app/api/exam/route";
import { POST as score } from "../app/api/grade/route";
import { POST as ingest } from "../app/api/ingest/route";
import { POST as image } from "../app/api/image/route";
import { authorize, jsonBody } from "../lib/http";
process.env.ENABLE_DEMO_DATA = "true";
delete process.env.GROQ_API_KEY;
delete process.env.HAVAN_ACCESS_TOKEN;
const req = (path: string, body: unknown) =>
  new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
test("schema rejects four choices and invalid answer", () => {
  const q = database().questions[0];
  assert.throws(() =>
    QuestionSchema.parse({ ...q, options: q.options.slice(0, 4) }),
  );
  assert.throws(() => QuestionSchema.parse({ ...q, answer: 5 }));
});
test("schema rejects a domain in the wrong subject", () => {
  assert.throws(() =>
    QuestionSchema.parse({
      ...database().questions[0],
      subject: "Mathematics",
    }),
  );
});
test("unicode tokenization preserves Ethiopic and Oromo text", () => {
  assert.deepEqual(tokenize("ሰላም barnoota"), ["ሰላም", "barnoota"]);
});
test("retrieval finds source, applies UAT restriction, and respects budget", () => {
  assert.ok(retrieve("equivalent open propositions").length);
  assert.equal(retrieve("equivalent open propositions", "uat").length, 0);
  assert.ok(
    retrieve("equivalent open propositions", "all", 80).reduce(
      (s, c) => s + c.text.length,
      0,
    ) <= 80,
  );
  assert.deepEqual(retrieve("zyxwvu unknownabsolutely"), []);
});
test("shuffling preserves membership without mutating input", () => {
  const a = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffled(a).sort(), a);
  assert.deepEqual(a, [1, 2, 3, 4, 5]);
});
test("signed ticket rejects tampering", () => {
  const ticket = signExam(["demo-q-1"], 60);
  assert.deepEqual(verifyExam(ticket).ids, ["demo-q-1"]);
  const [p, s] = ticket.split(".");
  assert.throws(() =>
    verifyExam(`${p}.${s[0] === "a" ? "b" : "a"}${s.slice(1)}`),
  );
});
test("grades correctly and leaves predictions uncalibrated", () => {
  const q = database().questions[0];
  const r = grade([q], { [q.id]: q.answer });
  assert.equal(r.percentage, 100);
  assert.equal(r.prediction, null);
  assert.equal(grade([q], {}).percentage, 0);
});
test("casual greeting does not produce an unrelated textbook summary", async () => {
  const r = await chat(
    req("/api/chat", { messages: [{ role: "user", content: "Hi" }] }),
  );
  assert.match((await r.json()).content, /Welcome/);
});
test("strict chat refuses unsupported content without calling Groq", async () => {
  const r = await chat(
    req("/api/chat", {
      messages: [{ role: "user", content: "zyxwvu absolutelyunknown" }],
    }),
  );
  assert.match((await r.json()).content, /could not find supporting/);
});
test("strict response contains only installed source text", async () => {
  const r = await chat(
    req("/api/chat", {
      messages: [{ role: "user", content: "equivalent open propositions" }],
    }),
  );
  const b = await r.json();
  assert.equal(b.mode, "strict");
  assert.equal(b.sources[0].id, "demo-predicates");
  assert.match(b.content, /same truth value/);
});
test("general tutor reports missing key honestly", async () => {
  const r = await chat(
    req("/api/chat", {
      mode: "general",
      messages: [{ role: "user", content: "Explain stars" }],
    }),
  );
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /Groq is not configured/);
});
test("invalid chat body returns 400", async () => {
  assert.equal((await chat(req("/api/chat", { messages: [] }))).status, 400);
});
test("exam API never sends answer keys; server scores signed session", async () => {
  const r = await exam(
    req("/api/exam", { subject: "English", count: 3, minutes: 1 }),
  );
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.questions.length, 3);
  assert.ok(
    b.questions.every(
      (q: any) =>
        q.options.length === 5 &&
        q.subject === "English" &&
        !("answer" in q) &&
        !("explanation" in q),
    ),
  );
  const answers = Object.fromEntries(
    b.questions.map((q: any) => [
      q.id,
      database().questions.find((d) => d.id === q.id)!.answer,
    ]),
  );
  const report = await score(req("/api/grade", { token: b.token, answers }));
  assert.equal((await report.json()).percentage, 100);
  const rejected = await score(
    req("/api/grade", {
      token: b.token,
      answers: { "unassigned-question": 1 },
    }),
  );
  assert.equal(rejected.status, 400);
});
test("cross-origin calls are rejected", () => {
  assert.throws(() =>
    authorize(
      new Request("http://localhost/api/chat", {
        headers: { origin: "http://evil.example" },
      }),
    ),
  );
});
test("request size is limited before JSON parse", async () => {
  await assert.rejects(() =>
    jsonBody(req("/api/chat", { x: "a".repeat(100) }), 20),
  );
});
test("file extraction reads real text and rejects unsupported images", async () => {
  const form = new FormData();
  form.append(
    "file",
    new File(["Equivalent propositions share truth values."], "notes.txt", {
      type: "text/plain",
    }),
  );
  const r = await ingest(
    new Request("http://localhost/api/ingest", { method: "POST", body: form }),
  );
  assert.equal(r.status, 200);
  assert.match((await r.json()).text, /Equivalent/);
  const img = new FormData();
  img.append(
    "file",
    new File(["image data"], "image.png", { type: "image/png" }),
  );
  assert.equal(
    (
      await ingest(
        new Request("http://localhost/api/ingest", {
          method: "POST",
          body: img,
        }),
      )
    ).status,
    415,
  );
});
test("image generation fails clearly without credentials", async () => {
  assert.equal(
    (await image(req("/api/image", { prompt: "A physics diagram" }))).status,
    503,
  );
});
test("Groq handles DNS errors with bounded same-provider fallback", async () => {
  process.env.GROQ_API_KEY = "test-not-real";
  process.env.GROQ_FALLBACK_MODEL = "fallback";
  let calls = 0;
  try {
    const r = await complete([{ role: "user", content: "Hi" }], (async () => {
      calls++;
      if (calls === 1)
        throw Object.assign(new Error("DNS"), { code: "ENOTFOUND" });
      return Response.json({ choices: [{ message: { content: "Hello" } }] });
    }) as typeof fetch);
    assert.equal(calls, 2);
    assert.equal(r.model, "fallback");
  } finally {
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_FALLBACK_MODEL;
  }
});
test("real PDF text layer and DOCX extraction succeed", async () => {
  const { readFileSync } = await import("node:fs");
  for (const ext of ["pdf", "docx"]) {
    const form = new FormData();
    form.append(
      "file",
      new File([readFileSync(`tests/fixtures/text.${ext}`)], `fixture.${ext}`),
    );
    const r = await ingest(
      new Request("http://localhost/api/ingest", {
        method: "POST",
        body: form,
      }),
    );
    const b = await r.json();
    assert.equal(r.status, 200, JSON.stringify(b));
    assert.match(b.text, /Havan fixture/);
  }
});
test("expired exam ticket is rejected", () => {
  const ticket = signExam(["demo-q-1"], 60);
  const now = Date.now;
  Date.now = () => now() + 100000;
  try {
    assert.throws(() => verifyExam(ticket));
  } finally {
    Date.now = now;
  }
});
test("canonical proxy origin is accepted without trusting arbitrary forwarded headers", () => {
  process.env.HAVAN_APP_ORIGIN = "https://havan.example";
  try {
    assert.doesNotThrow(() =>
      authorize(
        new Request("http://internal/api/chat", {
          headers: { origin: "https://havan.example" },
        }),
      ),
    );
    assert.throws(() =>
      authorize(
        new Request("http://internal/api/chat", {
          headers: {
            origin: "https://evil.example",
            "x-forwarded-host": "evil.example",
          },
        }),
      ),
    );
  } finally {
    delete process.env.HAVAN_APP_ORIGIN;
  }
});
