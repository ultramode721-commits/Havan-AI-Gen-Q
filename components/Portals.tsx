"use client";
import { useEffect, useState } from "react";
import { MathLab } from "./MathLab";
import { api, download, newId } from "@/lib/client";
import { Markdown } from "./Markdown";
import { Upload, Plus, Download, ImagePlus } from "lucide-react";
export function Portal({ view }: { view: string }) {
  const [status, setStatus] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [text, setText] = useState(""),
    [image, setImage] = useState(""),
    [projects, setProjects] = useState<
      { id: string; name: string; notes: string }[]
    >([]),
    [name, setName] = useState("");
  useEffect(() => {
    void api("/api/status")
      .then(setStatus)
      .catch((e) => setError(e.message));
    try {
      setProjects(JSON.parse(localStorage.getItem("havan-projects") || "[]"));
    } catch {}
  }, []);
  function save(p: typeof projects) {
    setProjects(p);
    localStorage.setItem("havan-projects", JSON.stringify(p));
  }
  async function file(file: File) {
    setBusy(true);
    setError("");
    try {
      const f = new FormData();
      f.append("file", file);
      const result = await api("/api/ingest", f);
      setText(result.text);
      setError(
        result.notice +
          (result.truncated ? " Text truncated to 18,000 characters." : ""),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="module">
      <span className="eyebrow">HAVAN ACADEMY WORKSPACE</span>
      <h1>{view}</h1>
      {view === "Neural Training Portal" ? (
        <>
          <p className="lead">Inspect sources before they become knowledge.</p>
          <div className="stats">
            <div className="card">
              <strong>{status?.chunks ?? "—"}</strong>
              <span>Indexed passages</span>
            </div>
            <div className="card">
              <strong>{status?.questions ?? "—"}</strong>
              <span>Valid questions</span>
            </div>
            <div className="card">
              <strong>{status?.demo ? "Demo" : "Local"}</strong>
              <span>Database mode</span>
            </div>
          </div>
          <div className="card">
            <h2>Document extraction lab</h2>
            <p>
              Read a text PDF, DOCX, TXT, Markdown, CSV, or JSON file. Maximum 5
              MB / 100 PDF pages.
            </p>
            <label className="upload">
              <Upload size={20} />
              {busy ? "Extracting…" : "Choose a document"}
              <input
                disabled={busy}
                type="file"
                accept=".pdf,.docx,.txt,.md,.csv,.json"
                onChange={(e) =>
                  e.target.files?.[0] && void file(e.target.files[0])
                }
              />
            </label>
            <p className="muted">
              Review extracted text before use. This does not modify model
              weights or publish data. Curated databases are installed at build
              time using the documented JSON schema.
            </p>
          </div>
          {text && (
            <div className="card">
              <button
                onClick={() => download("extracted.txt", text, "text/plain")}
              >
                <Download size={16} />
                Export extraction
              </button>
              <pre>{text}</pre>
            </div>
          )}
        </>
      ) : view === "Projects" ? (
        <>
          <p className="lead">Give every big idea a place to grow.</p>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                save([
                  ...projects,
                  { id: newId(), name: name.trim(), notes: "" },
                ]);
                setName("");
              }
            }}
          >
            <input
              aria-label="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name your next project"
              maxLength={100}
            />
            <button className="primary">
              <Plus size={16} />
              Create project
            </button>
          </form>
          {!projects.length && (
            <div className="card muted">
              Your projects will appear here. Stored only in this browser.
            </div>
          )}
          {projects.map((p) => (
            <div className="card" key={p.id}>
              <div className="between">
                <h3>{p.name}</h3>
                <button
                  onClick={() => save(projects.filter((x) => x.id !== p.id))}
                >
                  Delete
                </button>
              </div>
              <textarea
                aria-label={`${p.name} notes`}
                placeholder="Research notes, goals, and next steps…"
                value={p.notes}
                onChange={(e) =>
                  save(
                    projects.map((x) =>
                      x.id === p.id ? { ...x, notes: e.target.value } : x,
                    ),
                  )
                }
              />
              <button
                onClick={() =>
                  download(
                    `${p.name.replace(/[^a-z0-9]/gi, "-")}.md`,
                    p.notes,
                    "text/markdown",
                  )
                }
              >
                Export notes
              </button>
            </div>
          ))}
        </>
      ) : view === "Artifacts" ? (
        <>
          <p className="lead">Turn ideas into something you can see.</p>
          <MathLab />
          <div className="card">
            <h2>
              <ImagePlus size={22} />
              Image studio
            </h2>
            <p>
              Optional Together AI integration. Requires a separate image API
              key; Groq is used for text only.
            </p>
            <textarea
              aria-label="Image description"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe an educational illustration…"
            />
            <button
              disabled={
                busy || text.trim().length < 5 || !status?.imageConfigured
              }
              className="primary"
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  setImage((await api("/api/image", { prompt: text })).image);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy
                ? "Generating…"
                : status?.imageConfigured
                  ? "Generate image"
                  : "Image provider not configured"}
            </button>
            {image && <img className="generated" src={image} alt={text} />}
          </div>
          <div className="card">
            <h2>Interactive skill chart</h2>
            <p>
              Complete a diagnostic to see measured scores by domain. Results
              include an exportable report.
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="lead">A quiet space to think in code.</p>
          <div className="card">
            <p>
              Write and export code or Markdown. Execution is disabled; user
              code is never run on the application server.
            </p>
            <textarea
              className="code-editor"
              aria-label="Code editor"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="// Start writing here…"
            />
            <button
              onClick={() =>
                download("havan-workspace.txt", text, "text/plain")
              }
            >
              Export code
            </button>
          </div>
          <div className="card">
            <Markdown text={"### Live Markdown & math preview\n\n" + text} />
          </div>
        </>
      )}
      {error && (
        <p role="status" className="notice">
          {error}
        </p>
      )}
    </section>
  );
}
