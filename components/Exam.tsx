"use client";
import { useEffect, useRef, useState } from "react";
import {
  Flag,
  Clock3,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { api, download } from "@/lib/client";
import { Markdown } from "./Markdown";
import type { PublicQuestion, Question } from "@/lib/schema";
type Session = {
  token: string;
  endsAt: number;
  questions: PublicQuestion[];
  demo: boolean;
  available: number;
  requested: number;
};
type Report = {
  correct: number;
  total: number;
  percentage: number;
  notice: string;
  domains: Record<string, { correct: number; total: number }>;
  review: (Question & { selected: number | null })[];
};
export function Exam({ diagnostic = false }: { diagnostic?: boolean }) {
  const [session, setSession] = useState<Session | null>(null),
    [report, setReport] = useState<Report | null>(null),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [flags, setFlags] = useState<Record<string, boolean>>({}),
    [index, setIndex] = useState(0),
    [remaining, setRemaining] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [subject, setSubject] = useState("Both"),
    [count, setCount] = useState(10),
    [minutes, setMinutes] = useState(15);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submitting = useRef(false);
  const autoAttempted = useRef(false);
  const submitRef = useRef<() => void>(() => {});
  async function submit() {
    if (!session || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await api<Report>("/api/grade", {
        token: session.token,
        answers: answersRef.current,
      });
      setReport(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  submitRef.current = () => void submit();
  useEffect(() => {
    if (!session || report) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((session.endsAt - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (seconds === 0 && !autoAttempted.current) {
        autoAttempted.current = true;
        submitRef.current();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session, report]);
  async function start() {
    setBusy(true);
    setError("");
    try {
      const s = await api<Session>("/api/exam", { subject, count, minutes });
      autoAttempted.current = false;
      setSession(s);
      setReport(null);
      setAnswers({});
      setFlags({});
      setIndex(0);
      setRemaining(minutes * 60);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (report)
    return (
      <section className="module">
        <span className="eyebrow">YOUR LEARNING, MEASURED</span>
        <h1>{diagnostic ? "Diagnostic results" : "Session complete"}</h1>
        <div className="score-card">
          <CheckCircle2 size={32} />
          <strong>{report.percentage}%</strong>
          <span>
            {report.correct} of {report.total} correct
          </span>
          <p>{report.notice}</p>
        </div>
        <div className="card">
          <h3>Skill profile</h3>
          {Object.entries(report.domains).map(([domain, v]) => (
            <div key={domain} className="skill">
              <div>
                <span>{domain}</span>
                <b>
                  {v.correct}/{v.total}
                </b>
              </div>
              <progress max={v.total} value={v.correct} />
            </div>
          ))}
          <p className="muted">
            Domains with no questions are unmeasured. This sample is too small
            to estimate official exam success.
          </p>
        </div>
        <div className="actions">
          <button
            onClick={() =>
              download(
                "havan-exam-report.json",
                JSON.stringify(report, null, 2),
              )
            }
          >
            Export report
          </button>
          <button
            className="primary"
            onClick={() => {
              setSession(null);
              setReport(null);
            }}
          >
            New session
          </button>
        </div>
        <h2>Answer review</h2>
        {report.review.map((q, i) => (
          <article className="card" key={q.id}>
            <small>
              {i + 1} · {q.domain} ·{" "}
              {q.selected === q.answer
                ? "Correct"
                : q.selected === null
                  ? "Unanswered"
                  : "Review"}
            </small>
            <Markdown text={q.text} />
            <p>
              Your choice:{" "}
              {q.selected === null ? "—" : String.fromCharCode(65 + q.selected)}{" "}
              · Correct: {String.fromCharCode(65 + q.answer)}
            </p>
            <Markdown text={q.explanation} />
            <small>Source: {q.source}</small>
          </article>
        ))}
      </section>
    );
  if (!session)
    return (
      <section className="module">
        <span className="eyebrow">
          {diagnostic ? "FIND YOUR NEXT STEP" : "THE PRACTICE ROOM"}
        </span>
        <h1>
          {diagnostic ? "Know where you stand." : "Prepare with purpose."}
        </h1>
        <p className="lead">
          {diagnostic
            ? "A focused English and Mathematics diagnostic. See strengths, identify gaps, and make your next study session count."
            : "A timed, five-choice practice environment with question flags, instant scoring, and source-linked explanations."}
        </p>
        <div className="two-col">
          <div className="card">
            <span className="pill">English</span>
            <h3>Think clearly. Read deeply.</h3>
            <p>
              Verbal Reasoning · Grammar · Vocabulary · Reading Comprehension
            </p>
          </div>
          <div className="card">
            <span className="pill coral">Mathematics</span>
            <h3>Reason beyond the formula.</h3>
            <p>Quantitative Problem Solving · Analytical Reasoning</p>
          </div>
        </div>
        <div className="card setup">
          <h2>{diagnostic ? "Configure diagnostic" : "Set up your session"}</h2>
          <label>
            Subject
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option>Both</option>
              <option>English</option>
              <option>Mathematics</option>
            </select>
          </label>
          <label>
            Questions
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <label>
            Minutes
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </label>
          <button className="primary" disabled={busy} onClick={start}>
            {busy
              ? "Preparing…"
              : diagnostic
                ? "Start diagnostic"
                : "Start practice"}{" "}
            <ArrowRight size={16} />
          </button>
          <p className="muted">
            Uses installed UAT/trained banks only. Practice questions are not
            represented as official papers. Historical batches appear only when
            imported with verified provenance.
          </p>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </section>
    );
  const q = session.questions[index];
  const disabled = busy || remaining === 0;
  return (
    <section className="module exam">
      <div className="exam-head">
        <div>
          <span className="eyebrow">
            {session.demo ? "LABELED DEMO PRACTICE" : "UAT PRACTICE"}
          </span>
          <h2>{q.subject}</h2>
        </div>
        <span className="timer" role="timer">
          <Clock3 size={18} />
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </span>
      </div>
      <progress
        value={Object.keys(answers).length}
        max={session.questions.length}
      />
      <p className="muted">
        {Object.keys(answers).length} / {session.questions.length} answered ·{" "}
        {session.available} questions available
      </p>
      <div className="question-grid">
        {session.questions.map((item, i) => (
          <button
            aria-label={`Question ${i + 1}${flags[item.id] ? ", flagged" : ""}`}
            aria-current={i === index ? "step" : undefined}
            className={`${answers[item.id] !== undefined ? "answered" : ""} ${flags[item.id] ? "flagged" : ""} ${i === index ? "current" : ""}`}
            key={item.id}
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <article className="card question">
        <div className="between">
          <small>
            QUESTION {index + 1} · {q.domain}
          </small>
          <button
            onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })}
            aria-pressed={!!flags[q.id]}
          >
            <Flag size={15} />
            {flags[q.id] ? "Flagged" : "Flag"}
          </button>
        </div>
        <Markdown text={q.text} />
        <fieldset disabled={disabled}>
          <legend className="sr-only">Choose one answer</legend>
          {q.options.map((option, i) => (
            <label
              className={`option ${answers[q.id] === i ? "selected" : ""}`}
              key={i}
            >
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === i}
                onChange={() => setAnswers({ ...answers, [q.id]: i })}
              />
              <span>{String.fromCharCode(65 + i)}</span>
              <Markdown text={option} />
            </label>
          ))}
        </fieldset>
        <button
          disabled={disabled}
          onClick={() => {
            const copy = { ...answers };
            delete copy[q.id];
            setAnswers(copy);
          }}
        >
          Clear my choice
        </button>
      </article>
      <div className="between">
        <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <ArrowLeft size={16} />
          Previous
        </button>
        {index < session.questions.length - 1 ? (
          <button onClick={() => setIndex(index + 1)}>
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <button className="primary" disabled={busy} onClick={submit}>
            Finish & score
          </button>
        )}
      </div>
      <button disabled={busy} onClick={submit}>
        Submit session now ({Object.keys(answers).length}/
        {session.questions.length})
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
