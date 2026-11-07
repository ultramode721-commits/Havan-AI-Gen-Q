"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  FlaskConical,
  Folder,
  GraduationCap,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Moon,
  Pencil,
  Paperclip,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { Markdown } from "./Markdown";
import dynamic from "next/dynamic";
const Exam = dynamic(() => import("./Exam").then((m) => m.Exam));
const Portal = dynamic(() => import("./Portals").then((m) => m.Portal));
import { api, download, newId, setAccessToken } from "@/lib/client";
import {
  moveChatToTrash,
  permanentlyDeleteChat,
  renameChat,
  restoreChat,
  updateChatFlags,
} from "@/lib/chat-history";
import type { ChatRecord } from "@/lib/chat-history";
import type { HavanModelId, RoutedModel } from "@/lib/models";
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { id: string; source: string; title: string }[];
  mode?: string;
  model?: RoutedModel | null;
};
type Chat = ChatRecord<Message>;
const navigation = [
  { name: "Chat", icon: MessageCircle },
  { name: "Predictor", icon: ChartNoAxesCombined },
  { name: "UAT Simulator", icon: GraduationCap },
  { name: "Neural Training Portal", icon: BrainCircuit },
  { name: "Projects", icon: Folder },
  { name: "Artifacts", icon: Sparkles },
  { name: "Code", icon: Code2 },
];
export default function HavanApp() {
  const [view, setView] = useState("Chat"),
    [open, setOpen] = useState(true),
    [dark, setDark] = useState(false),
    [settings, setSettings] = useState(false),
    [token, setToken] = useState(""),
    [status, setStatus] = useState<any>(null),
    [mode, setMode] = useState<"strict" | "general">("strict"),
    [havanModel, setHavanModel] = useState<HavanModelId>("havan-pro"),
    [language, setLanguage] = useState("English"),
    [input, setInput] = useState(""),
    [messages, setMessages] = useState<Message[]>([]),
    [chats, setChats] = useState<Chat[]>([]),
    [trash, setTrash] = useState<Chat[]>([]),
    [chatId, setChatId] = useState(""),
    [search, setSearch] = useState(""),
    [showTrash, setShowTrash] = useState(false),
    [menuChatId, setMenuChatId] = useState(""),
    [renamingChatId, setRenamingChatId] = useState(""),
    [renameDraft, setRenameDraft] = useState(""),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [attachment, setAttachment] = useState<{
      name: string;
      text: string;
      size: number;
    } | null>(null),
    [loaded, setLoaded] = useState(false),
    [copied, setCopied] = useState("");
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    if (["Predictor", "UAT Simulator"].includes(view))
      setVisited((v) => (v.includes(view) ? v : [...v, view]));
  }, [view]);
  const controller = useRef<AbortController | null>(null),
    bottom = useRef<HTMLDivElement>(null),
    fileRef = useRef<HTMLInputElement>(null),
    textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    try {
      setChats(JSON.parse(localStorage.getItem("havan-chats") || "[]"));
      setTrash(JSON.parse(localStorage.getItem("havan-trash") || "[]"));
      setDark(localStorage.getItem("havan-theme") === "dark");
    } catch {}
    setLoaded(true);
    void api("/api/status")
      .then(setStatus)
      .catch((e) => setError(e.message));
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (loaded) localStorage.setItem("havan-theme", dark ? "dark" : "light");
  }, [dark, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem("havan-chats", JSON.stringify(chats));
  }, [chats, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem("havan-trash", JSON.stringify(trash));
  }, [trash, loaded]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const maxHeight = 220;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);
  function newChat() {
    if (busy || uploading) return;
    setView("Chat");
    setMessages([]);
    setChatId("");
    setAttachment(null);
    setError("");
    setShowTrash(false);
    setMenuChatId("");
  }
  function saveChatTitle(id: string) {
    if (busy || uploading) return;
    setChats((old) => renameChat(old, id, renameDraft));
    setRenamingChatId("");
    setRenameDraft("");
  }
  function moveConversationToTrash(id: string) {
    if (busy || uploading) return;
    const moved = moveChatToTrash(chats, trash, id);
    setChats(moved.chats);
    setTrash(moved.trash);
    setMenuChatId("");
    if (chatId === id) {
      setChatId("");
      setMessages([]);
      setAttachment(null);
    }
  }
  function restoreConversation(id: string) {
    const restored = restoreChat(chats, trash, id);
    setChats(restored.chats);
    setTrash(restored.trash);
    const conversation = restored.chats.find((item) => item.id === id);
    if (conversation) {
      setChatId(id);
      setMessages(conversation.messages);
      setView("Chat");
      setAttachment(null);
      setShowTrash(false);
    }
  }
  function permanentlyRemoveConversation(id: string) {
    if (busy || uploading) return;
    if (!window.confirm("Permanently delete this conversation? This cannot be undone."))
      return;
    setTrash((old) => permanentlyDeleteChat(old, id));
  }
  async function send(prompt = input) {
    if (!prompt.trim() || busy || uploading) return;
    const attachedFile = attachment;
    const id = chatId || newId();
    setChatId(id);
    const next: Message[] = [
      ...messages,
      { id: newId(), role: "user", content: prompt.trim() },
    ];
    setMessages(next);
    setInput("");
    setError("");
    setBusy(true);
    const ctl = new AbortController();
    controller.current = ctl;
    try {
      const result = await api(
        "/api/chat",
        {
          mode,
          havanModel,
          language,
          messages: next
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
          attachment: attachedFile?.text,
        },
        ctl.signal,
      );
      const updated: Message[] = [
        ...next,
        {
          id: newId(),
          role: "assistant",
          content: result.content,
          sources: result.sources,
          mode: result.mode,
          model: result.model,
        },
      ];
      setMessages(updated);
      if (attachedFile) setAttachment(null);
      setChats((old) =>
        [
          {
            id,
            title:
              old.find((chat) => chat.id === id)?.title ??
              next[0].content.slice(0, 60),
            messages: updated,
            pinned: old.find((chat) => chat.id === id)?.pinned,
            highlighted: old.find((chat) => chat.id === id)?.highlighted,
          },
          ...old.filter((chat) => chat.id !== id),
        ].slice(0, 50),
      );
    } catch (e) {
      setError(
        (e as Error).name === "AbortError"
          ? "Response stopped."
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
      controller.current = null;
    }
  }
  async function upload(file: File) {
    if (busy || uploading) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await api("/api/ingest", form);
      setAttachment({ name: result.name, text: result.text, size: file.size });
      setError(
        result.notice +
          (result.truncated
            ? " Only the first 18,000 characters are included."
            : ""),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  const welcome = !messages.length;
  const historyItems = (showTrash ? trash : chats)
    .filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      showTrash
        ? (b.deletedAt ?? 0) - (a.deletedAt ?? 0)
        : Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
    );
  return (
    <div className={`app ${open ? "sidebar-open" : "sidebar-closed"}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <GraduationCap size={25} />
          </span>
          <div>
            <b>Havan AI</b>
            <small>BY HAVAN ACADEMY</small>
          </div>
          <button
            className="icon collapse"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <button className="new-chat" onClick={newChat} disabled={busy || uploading}>
          <Plus size={19} />
          New conversation<span>↗</span>
        </button>
        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <button
              disabled={(busy || uploading) && name !== "Chat"}
              className={view === name ? "active" : ""}
              onClick={() => {
                setView(name);
                if (window.innerWidth < 760) setOpen(false);
              }}
              key={name}
            >
              <Icon size={18} />
              {name}
              {name === "UAT Simulator" && (
                <span className="tiny">PRACTICE</span>
              )}
            </button>
          ))}
        </nav>
        <div className="recent-label">
          <span>{showTrash ? "RECENTLY DELETED" : "YOUR CONVERSATIONS"}</span>
          <div className="history-tools">
            <button
              className="history-switch"
              onClick={() => {
                setShowTrash(!showTrash);
                setMenuChatId("");
                setRenamingChatId("");
              }}
            >
              {showTrash ? "Chats" : `Trash${trash.length ? ` (${trash.length})` : ""}`}
            </button>
            <Search size={13} />
          </div>
        </div>
        <input
          className="history-search"
          aria-label="Search conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your chats…"
        />
        <div className="history">
          {historyItems.map((chat) =>
            showTrash ? (
              <div className="history-row deleted" key={chat.id}>
                <button
                  className="history-open"
                  aria-label={`Restore and open ${chat.title}`}
                  disabled={busy || uploading}
                  onClick={() => restoreConversation(chat.id)}
                >
                  <MessageCircle size={14} />
                  <span>{chat.title}</span>
                </button>
                <button
                  className="history-action"
                  aria-label={`Restore ${chat.title}`}
                  disabled={busy || uploading}
                  onClick={() => restoreConversation(chat.id)}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  className="history-action danger"
                  aria-label={`Permanently delete ${chat.title}`}
                  disabled={busy || uploading}
                  onClick={() => permanentlyRemoveConversation(chat.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div
                className={`history-row ${view === "Chat" && chat.id === chatId ? "active" : ""} ${chat.highlighted ? "highlighted" : ""}`}
                key={chat.id}
              >
                {renamingChatId === chat.id ? (
                  <form
                    className="history-rename"
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveChatTitle(chat.id);
                    }}
                  >
                    <input
                      aria-label={`Rename ${chat.title}`}
                      value={renameDraft}
                      autoFocus
                      maxLength={80}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") setRenamingChatId("");
                      }}
                    />
                    <button
                      type="submit"
                      className="history-action"
                      aria-label="Save conversation name"
                      disabled={busy || uploading}
                    >
                      <Check size={14} />
                    </button>
                  </form>
                ) : (
                  <button
                    className="history-open"
                    disabled={busy || uploading}
                    onClick={() => {
                      setView("Chat");
                      setChatId(chat.id);
                      setMessages(chat.messages);
                      setAttachment(null);
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>{chat.title}</span>
                    {chat.pinned && <Pin size={12} aria-label="Pinned" />}
                  </button>
                )}
                <button
                  className="history-action menu-trigger"
                  aria-label={`Conversation actions for ${chat.title}`}
                  aria-expanded={menuChatId === chat.id}
                  disabled={busy || uploading}
                  onClick={() =>
                    setMenuChatId(menuChatId === chat.id ? "" : chat.id)
                  }
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuChatId === chat.id && (
                  <div className="history-menu">
                    <button
                      disabled={busy || uploading}
                      onClick={() => {
                        setChats((old) =>
                          updateChatFlags(old, chat.id, {
                            pinned: !chat.pinned,
                            highlighted: chat.highlighted,
                          }),
                        );
                        setMenuChatId("");
                      }}
                    >
                      <Pin size={14} /> {chat.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      disabled={busy || uploading}
                      onClick={() => {
                        setRenameDraft(chat.title);
                        setRenamingChatId(chat.id);
                        setMenuChatId("");
                      }}
                    >
                      <Pencil size={14} /> Rename
                    </button>
                    <button
                      disabled={busy || uploading}
                      onClick={() => {
                        setChats((old) =>
                          updateChatFlags(old, chat.id, {
                            pinned: chat.pinned,
                            highlighted: !chat.highlighted,
                          }),
                        );
                        setMenuChatId("");
                      }}
                    >
                      <Star size={14} /> {chat.highlighted ? "Remove highlight" : "Highlight"}
                    </button>
                    <button
                      className="danger"
                      disabled={busy || uploading}
                      onClick={() => moveConversationToTrash(chat.id)}
                    >
                      <Trash2 size={14} /> Move to trash
                    </button>
                  </div>
                )}
              </div>
            ),
          )}
          {!historyItems.length && (
            <p>
              {showTrash
                ? "Deleted conversations will appear here for recovery."
                : "Your next discovery starts here."}
            </p>
          )}
        </div>
        <div className="academy">
          <span className="academy-logo">
            <img src="/havan-academy.png" alt="Havan Academy logo" />
          </span>
          <div>
            <b>Built for your next chapter.</b>
            <small>Ethiopian higher education</small>
          </div>
        </div>
        <button className="profile" onClick={() => setSettings(true)}>
          <span className="avatar">H</span>
          <span>
            Student workspace<small>Local history · Private by default</small>
          </span>
          <Settings size={17} />
        </button>
      </aside>
      {open && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <main>
        <header className="topbar">
          <div className="header-left">
            <button
              className="icon"
              aria-label="Toggle navigation"
              onClick={() => setOpen(!open)}
            >
              <Menu size={21} />
            </button>
            <span>Havan AI</span>
            <span className="pill small">ACADEMIC</span>
          </div>
          <div className="header-right">
            <button
              className="icon"
              aria-label="Toggle color theme"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="icon"
              aria-label="Open settings"
              onClick={() => setSettings(true)}
            >
              <Settings size={19} />
            </button>
          </div>
        </header>
        {view === "Chat" ? (
          <div className={`chat-view ${welcome ? "welcome" : ""}`}>
            <div className="chat-scroll">
              {welcome ? (
                <div className="welcome-content">
                  <span className="eyebrow">
                    <span className="status-dot" /> YOUR ACADEMIC CO-PILOT
                  </span>
                  <div className="hero-brand">
                    <span className="hero-logo">
                      <GraduationCap size={44} />
                    </span>
                    <h1>Havan AI</h1>
                  </div>
                  <h2>
                    A little curiosity.
                    <br />
                    <span>Limitless possibilities.</span>
                  </h2>
                  <p className="intro">
                    From your first question to your next breakthrough.
                    <br />A study companion for the way you think.
                  </p>
                  <div className="suggestions">
                    {[
                      {
                        icon: BookOpen,
                        title: "Make it make sense",
                        text: "Explain a freshman concept",
                        prompt: "Explain equivalent open propositions.",
                      },
                      {
                        icon: GraduationCap,
                        title: "Ready for your UAT?",
                        text: "Build confidence with practice",
                        action: "UAT Simulator",
                      },
                      {
                        icon: FlaskConical,
                        title: "Go one level deeper",
                        text: "Explore mathematics & science",
                        prompt:
                          "Explain the derivative of a quadratic function.",
                      },
                      {
                        icon: ChartNoAxesCombined,
                        title: "Find your starting point",
                        text: "Discover your strengths",
                        action: "Predictor",
                      },
                    ].map(({ icon: Icon, title, text, prompt, action }) => (
                      <button
                        key={title}
                        onClick={() =>
                          action ? setView(action) : setInput(prompt!)
                        }
                      >
                        <Icon size={20} />
                        <b>{title}</b>
                        <span>{text}</span>
                        <span className="suggest-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="messages">
                  {messages.map((m) => (
                    <article className={`message ${m.role}`} key={m.id}>
                      {m.role === "assistant" && (
                        <span className="message-logo">
                          <GraduationCap size={20} />
                        </span>
                      )}
                      <div className="message-body">
                        {m.role === "assistant" && (
                          <div className="message-meta">
                            Havan AI{" "}
                            <span>
                              {m.mode === "strict"
                                ? m.model
                                  ? `${m.model.label} · ${m.model.provider} ${m.model.providerModel}`
                                  : "Source excerpts"
                                : m.model
                                  ? `${m.model.label} · ${m.model.provider} ${m.model.providerModel}`
                                  : "General tutor"}
                            </span>
                          </div>
                        )}
                        <Markdown text={m.content} />
                        {m.sources && m.sources.length > 0 && (
                          <details className="sources">
                            <summary>
                              <FileText size={13} />
                              {m.sources.length} local source
                              {m.sources.length === 1 ? "" : "s"}
                            </summary>
                            {m.sources.map((s) => (
                              <p key={s.id}>
                                <b>
                                  [{s.id}] {s.title}
                                </b>
                                <br />
                                {s.source}
                              </p>
                            ))}
                          </details>
                        )}
                        <button
                          className="copy icon"
                          aria-label="Copy message"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(m.content);
                              setCopied(m.id);
                            } catch {
                              setError(
                                "Clipboard access is unavailable. Select and copy the message manually.",
                              );
                            }
                          }}
                        >
                          {copied === m.id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </article>
                  ))}
                  {busy && (
                    <div className="thinking">
                      <span />
                      <span />
                      <span /> Working on your question
                    </div>
                  )}
                  <div ref={bottom} />
                </div>
              )}
            </div>
            <div className="composer-area">
              {attachment && (
                <div className="attachment">
                  <FileText size={15} />
                  <span className="attachment-details">
                    <b>{attachment.name}</b>
                    <small>
                      {attachment.name.split(".").pop()?.toUpperCase()} · {Math.max(1, Math.round(attachment.size / 1024))} KB
                    </small>
                  </span>
                  <button
                    className="icon"
                    aria-label="Remove attachment"
                    disabled={busy || uploading}
                    onClick={() => setAttachment(null)}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
              {error && (
                <p className="composer-notice" role="status">
                  {error}
                </p>
              )}
              {uploading && (
                <p className="composer-notice upload-status" role="status">
                  Preparing your document…
                </p>
              )}
              <form
                className={`composer ${busy ? "generating" : ""}`}
                aria-busy={busy}
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <textarea
                  ref={textareaRef}
                  aria-label="Message Havan AI"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Message Havan AI…"
                  rows={1}
                  maxLength={12000}
                />
                <div className="composer-toolbar">
                  <div className="actions">
                    <button
                      type="button"
                      className="icon"
                      disabled={busy || uploading}
                      aria-label="Attach document"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Paperclip size={19} />
                    </button>
                    <input
                      ref={fileRef}
                      hidden
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.json,.csv"
                      onChange={(e) => {
                        if (e.target.files?.[0]) void upload(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                    <label className="model-select">
                      <Sparkles size={14} />
                      <select
                        aria-label="Havan model"
                        value={havanModel}
                        onChange={(e) =>
                          setHavanModel(e.target.value as HavanModelId)
                        }
                      >
                        {[
                          { id: "havan-pro", label: "Havan Pro", provider: "Groq" },
                          { id: "havan-sol", label: "Havan 2.5 Sol", provider: "Qwen" },
                          { id: "havan-jarvis", label: "Havan-3 Jarvis", provider: "Qwen" },
                        ].map((option) => {
                          const configured = status?.models?.find(
                            (item: { id: string; available: boolean }) =>
                              item.id === option.id,
                          )?.available;
                          return (
                            <option
                              key={option.id}
                              value={option.id}
                              disabled={configured === false}
                            >
                              {option.label} · {option.provider}
                              {configured === false ? " · Setup required" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="mode-select">
                      <ShieldCheck size={15} />
                      <select
                        aria-label="Answer mode"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as typeof mode)}
                      >
                        <option value="strict">Database only</option>
                        <option value="general">General tutor</option>
                      </select>
                    </label>
                  </div>
                  <div className="actions">
                    <select
                      className="language"
                      aria-label="Response language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {[
                        "English",
                        "Amharic",
                        "Afaan Oromo",
                        "Tigrinya",
                        "Arabic",
                        "French",
                        "Spanish",
                        "Chinese",
                        "Auto-detect",
                      ].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                    {busy ? (
                      <button
                        type="button"
                        className="send"
                        aria-label="Stop response"
                        onClick={() => controller.current?.abort()}
                      >
                        <Square size={15} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="send"
                        disabled={!input.trim() || uploading}
                        aria-label="Send message"
                      >
                        <ArrowUp size={21} />
                      </button>
                    )}
                  </div>
                </div>
              </form>
              <div className="composer-footer">
                <span>
                  {mode === "strict"
                    ? "Grounded in your sources. Excerpts stay in the source language."
                    : "General AI answers may contain mistakes. Verify important information."}
                </span>
                <span>Havan Academy</span>
              </div>
            </div>
          </div>
        ) : view === "Predictor" || view === "UAT Simulator" ? null : (
          <Portal key={view} view={view} />
        )}
        {visited.map((v) => (
          <div key={v} hidden={view !== v}>
            <Exam diagnostic={v === "Predictor"} />
          </div>
        ))}
      </main>
      {settings && (
        <div className="modal-backdrop" onClick={() => setSettings(false)}>
          <section
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace settings"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="between">
              <h2>Make Havan yours.</h2>
              <button
                className="icon"
                aria-label="Close settings"
                onClick={() => setSettings(false)}
              >
                <X size={20} />
              </button>
            </div>
            <label>
              Preferred response language
              <input
                value={language}
                maxLength={60}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Any language name"
              />
            </label>
            <label>
              Appearance
              <button onClick={() => setDark(!dark)}>
                {dark ? "Dark" : "Light"} mode — switch
              </button>
            </label>
            <label>
              Workspace access token
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Provided by your deployment administrator"
                autoComplete="off"
              />
            </label>
            <button
              className="primary"
              onClick={async () => {
                setAccessToken(token);
                try {
                  setStatus(await api("/api/status"));
                  setError("");
                  setSettings(false);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Connect workspace
            </button>
            <p className="muted">
              Token stays in memory and clears on reload. Chats and project
              notes stay in this browser; no account or cloud sync is implied.
            </p>
            <div className="card">
              <h3>Service status</h3>
              <p>
                Groq:{" "}
                {status?.chatConfigured
                  ? "Key configured; live call not verified"
                  : "Not configured"}
              </p>
              <p>
                Sources: {status?.chunks ?? "—"} passages ·{" "}
                {status?.questions ?? "—"} questions
              </p>
              <p>
                Images:{" "}
                {status?.imageConfigured ? "Key configured" : "Not configured"}
              </p>
              <p>OCR / image understanding: unavailable</p>
            </div>
            <div className="actions">
              <button
                onClick={() =>
                  download(
                    "havan-conversations.json",
                    JSON.stringify(chats, null, 2),
                  )
                }
              >
                Export chats
              </button>
              <button
                onClick={() => {
                  setChats([]);
                  setMessages([]);
                  setChatId("");
                }}
              >
                Clear local chats
              </button>
            </div>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

