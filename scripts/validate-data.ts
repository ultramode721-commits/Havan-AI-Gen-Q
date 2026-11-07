import { database } from "../lib/database";
const d = database();
console.log(
  JSON.stringify(
    {
      chunks: d.chunks.length,
      questions: d.questions.length,
      demo: d.demo,
      issues: d.issues,
    },
    null,
    2,
  ),
);
