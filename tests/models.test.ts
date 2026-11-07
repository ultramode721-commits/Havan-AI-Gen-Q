import test from "node:test";
import assert from "node:assert/strict";
import { completeWithHavanModel, modelCatalog } from "../lib/models";

const envKeys = [
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "GROQ_FALLBACK_MODEL",
  "HAVAN_PRO_GROQ_MODEL",
  "QWEN_API_KEY",
  "QWEN_API_BASE_URL",
  "QWEN_FALLBACK_MODEL",
  "HAVAN_SOL_QWEN_MODEL",
  "HAVAN_JARVIS_QWEN_MODEL",
];
const initialEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
test.after(() => {
  for (const key of envKeys) {
    const value = initialEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("model catalog exposes provider readiness without exposing credentials", () => {
  process.env.GROQ_API_KEY = "test-key";
  process.env.HAVAN_PRO_GROQ_MODEL = "llama-test";
  process.env.QWEN_API_KEY = "qwen-test-key";
  process.env.QWEN_API_BASE_URL =
    "https://workspace.us-east-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions";
  const catalog = modelCatalog();
  assert.deepEqual(
    catalog.map(({ id, provider, providerModel, available }) => ({
      id,
      provider,
      providerModel,
      available,
    })),
    [
      {
        id: "havan-pro",
        provider: "Groq",
        providerModel: "llama-test",
        available: true,
      },
      {
        id: "havan-sol",
        provider: "Qwen",
        providerModel: "qwen-plus",
        available: true,
      },
      {
        id: "havan-jarvis",
        provider: "Qwen",
        providerModel: "qwen-max",
        available: true,
      },
    ],
  );
  assert.equal(JSON.stringify(catalog).includes("test-key"), false);
  assert.equal(JSON.stringify(catalog).includes("qwen-test-key"), false);
});

test("Havan 2.5 Sol routes to the configured Qwen endpoint and model", async () => {
  process.env.QWEN_API_KEY = "qwen-test-key";
  process.env.QWEN_API_BASE_URL =
    "https://workspace.us-east-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions";
  process.env.HAVAN_SOL_QWEN_MODEL = "qwen-sol-test";
  let requestUrl = "";
  let requestBody: any;
  const result = await completeWithHavanModel(
    "havan-sol",
    [{ role: "user", content: "Explain a derivative." }],
    (async (input, init) => {
      requestUrl = String(input);
      requestBody = JSON.parse(String(init?.body));
      return Response.json({
        choices: [{ message: { content: "A derivative measures change." } }],
      });
    }) as typeof fetch,
  );
  assert.equal(requestUrl, process.env.QWEN_API_BASE_URL);
  assert.equal(requestBody.model, "qwen-sol-test");
  assert.equal(result.model.label, "Havan 2.5 Sol");
  assert.equal(result.model.provider, "Qwen");
});

test("Havan Pro routes to Groq with its selected model configuration", async () => {
  process.env.GROQ_API_KEY = "groq-test-key";
  process.env.HAVAN_PRO_GROQ_MODEL = "groq-pro-test";
  let requestUrl = "";
  let requestBody: any;
  const result = await completeWithHavanModel(
    "havan-pro",
    [{ role: "user", content: "Explain a derivative." }],
    (async (input, init) => {
      requestUrl = String(input);
      requestBody = JSON.parse(String(init?.body));
      return Response.json({
        choices: [{ message: { content: "A derivative measures change." } }],
      });
    }) as typeof fetch,
  );
  assert.equal(requestUrl, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(requestBody.model, "groq-pro-test");
  assert.equal(result.model.label, "Havan Pro");
  assert.equal(result.model.provider, "Groq");
});

test("Havan-3 Jarvis is unavailable until Qwen is configured", async () => {
  delete process.env.QWEN_API_KEY;
  delete process.env.QWEN_API_BASE_URL;
  await assert.rejects(
    completeWithHavanModel("havan-jarvis", [
      { role: "user", content: "Compare two physical models." },
    ]),
    /Havan-3 Jarvis is not connected/,
  );
});

