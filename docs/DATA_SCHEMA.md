# Canonical data contract — version 1

Every one of the four files has this envelope:

```json
{ "schemaVersion": 1, "chunks": [], "questions": [] }
```

File roles:

| File                    | Intended content                                                    |
| ----------------------- | ------------------------------------------------------------------- |
| v1_indexed_modules.json | Reviewed freshman module passages                                   |
| v2_knowledge_graph.json | Curated entity/relation descriptions flattened into source passages |
| v3_qa_bank.json         | UAT questions and answer/explanation passages                       |
| v4_logic_reasoning.json | Worked reasoning examples and analytical questions                  |

These filenames do not imply a discovered upstream schema. None existed in the reviewed repository. This is a new explicit ingestion contract rather than an invented mapping to unavailable data.

## Source passage

```json
{
  "id": "logic-1-5",
  "title": "Equivalent open propositions",
  "text": "Open propositions are equivalent over U when they have the same truth value for every member of U.",
  "source": "Reviewed module title, edition, section 1.5",
  "repository": "modules",
  "language": "en",
  "tags": ["logic", "equivalent predicates"],
  "page": 12
}
```

`repository`: `modules`, `uat`, or `trained`. `language` and `tags` default to `en` and `[]`. IDs must be unique across all chunk files. Keep passages self-contained, preferably 400–1,500 characters. `page` is optional and positive. Text is capped at 20,000 characters; retrieval excerpts may truncate it to 1,800.

## Five-choice question

```json
{
  "id": "reviewed-paper-q1",
  "text": "Solve $3x+7=22$.",
  "subject": "Mathematics",
  "domain": "Quantitative Problem Solving",
  "options": ["3", "4", "5", "6", "7"],
  "answer": 2,
  "explanation": "Subtract 7 to obtain 3x=15. Divide by 3 to get x=5.",
  "source": "Actual reviewed paper title and question reference",
  "repository": "uat",
  "year": 2018
}
```

`answer` is ZERO-BASED: 0=A, 1=B, 2=C, 3=D, 4=E. Exactly five distinct nonempty option strings are required. The server rejects missing explanations, unsupported subjects and inconsistent domain/subject assignments. Record whether `year` is Ethiopian or Gregorian in `source`; never infer calendar or official status from the number alone.

| Subject     | Allowed domains                                              |
| ----------- | ------------------------------------------------------------ |
| English     | Verbal Reasoning; Grammar; Vocabulary; Reading Comprehension |
| Mathematics | Quantitative Problem Solving; Analytical Reasoning           |

Question repositories are only `uat` and `trained`. A `year` is optional; no historical year is invented for demo material. Curate permission, provenance and answers before installation. Do not place JSON answer banks in `public/`.

Legacy repository records used `{id:number,text,options:string[4],correctAnswer:number,explanation,subject}` with no provenance or domain. They need human review and real five-choice source material. The importer deliberately refuses to invent a fifth distractor, source, year or missing correct answer.
