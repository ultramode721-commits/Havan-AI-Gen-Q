import { z } from "zod";
export const domains = [
  "Verbal Reasoning",
  "Grammar",
  "Vocabulary",
  "Reading Comprehension",
  "Quantitative Problem Solving",
  "Analytical Reasoning",
] as const;
export const ChunkSchema = z.object({
  id: z.string().min(1).max(100),
  text: z.string().min(1).max(20000),
  title: z.string().min(1),
  source: z.string().min(1),
  repository: z.enum(["modules", "uat", "trained"]),
  language: z.string().default("en"),
  tags: z.array(z.string()).default([]),
  page: z.number().int().positive().optional(),
});
export const QuestionSchema = z
  .object({
    id: z.string().min(1).max(100),
    text: z.string().min(1),
    subject: z.enum(["English", "Mathematics"]),
    domain: z.enum(domains),
    options: z.tuple([
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
    ]),
    answer: z.number().int().min(0).max(4),
    explanation: z.string().min(1),
    source: z.string().min(1),
    repository: z.enum(["uat", "trained"]),
    year: z.number().int().optional(),
  })
  .superRefine((q, ctx) => {
    if (new Set(q.options).size !== 5)
      ctx.addIssue({
        code: "custom",
        message: "Five distinct choices required",
      });
    if (
      (q.subject === "English") !==
      domains.slice(0, 4).includes(q.domain as (typeof domains)[0])
    )
      ctx.addIssue({ code: "custom", message: "Subject/domain mismatch" });
  });
export type Chunk = z.infer<typeof ChunkSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type PublicQuestion = Omit<Question, "answer" | "explanation">;
export type Mode = "strict" | "general";
