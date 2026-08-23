"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Plus, Bot, User, Copy, Bookmark, Trash2, Pencil, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Conversation, Message } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "How should I price my product?",
  "What are my biggest business risks?",
  "Who is my ideal customer?",
  "How can I acquire my first 100 customers?",
  "What should I focus on this month?",
];

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE}/api/v1`;

export default function AIPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useApiClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setBusinessId(id);
      const convId = searchParams.get("conversation");
      if (convId) setActiveConvId(convId);
    });
  }, [params, searchParams]);

  useEffect(() => {
    if (!businessId) return;
    loadConversations();
  }, [businessId]);

  useEffect(() => {
    if (activeConvId) loadMessages(activeConvId);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function loadConversations() {
    try {
      const data = await api.get<{ items: Conversation[] }>(`/businesses/${businessId}/conversations`);
      setConversations(data.items);
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }

  async function loadMessages(convId: string) {
    setLoadingMsgs(true);
    try {
      const conv = await api.get<Conversation>(`/businesses/${businessId}/conversations/${convId}`);
      setMessages(conv.messages?.filter((m) => m.role !== "system") || []);
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setLoadingMsgs(false);
    }
  }

  const sendMessage = useCallback(async (text?: string) => {
    const message = (text || input).trim();
    if (!message || streaming) return;

    setInput("");
    setStreaming(true);
    setStreamingContent("");

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || "",
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/businesses/${businessId}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, conversationId: activeConvId }),
      });

      if (!res.ok) throw new Error("AI request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let newConvId = activeConvId;
      let pending = "";
      let streamError = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) { fullContent += data.delta; setStreamingContent(fullContent); }
            if (data.error) streamError = data.error;
            if (data.done) {
              const convData = await api.get<{ items: Conversation[] }>(`/businesses/${businessId}/conversations`);
              setConversations(convData.items);
              if (!activeConvId && convData.items[0]) {
                newConvId = convData.items[0].id;
                setActiveConvId(newConvId);
              }
            }
          } catch { /* skip malformed */ }
        }
      }

      if (pending.startsWith("data: ")) {
        try {
          const data = JSON.parse(pending.slice(6));
          if (data.error) streamError = data.error;
          if (data.delta) { fullContent += data.delta; setStreamingContent(fullContent); }
        } catch { /* ignore */ }
      }

      if (streamError) throw new Error(streamError);
      if (!fullContent.trim()) throw new Error("The AI provider returned an empty response. Please try again.");

      const assistantMsg: Message = {
        id: `temp-ai-${Date.now()}`,
        conversationId: newConvId || "",
        role: "assistant",
        content: fullContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI response failed. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, activeConvId, businessId, getToken, api]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  async function saveInsight(content: string) {
    try {
      await api.post(`/businesses/${businessId}/insights`, {
        title: content.substring(0, 80) + "...",
        content,
        source: "AI Consultant",
      });
      toast.success("Saved as insight");
    } catch {
      toast.error("Failed to save insight");
    }
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      toast.success("Response copied to clipboard");
      window.setTimeout(() => setCopiedMessageId((id) => id === message.id ? null : id), 2_000);
    } catch {
      toast.error("Could not copy the response. Please try again.");
    }
  }

  function newConversation() { setActiveConvId(null); setMessages([]); }

  function startEditingConversation(conversation: Conversation) {
    setEditingConvId(conversation.id);
    setEditingTitle(conversation.title);
  }

  async function saveConversationTitle(conversationId: string) {
    const title = editingTitle.trim();
    if (!title) { toast.error("A chat title is required"); return; }
    try {
      const updated = await api.patch<Conversation>(`/businesses/${businessId}/conversations/${conversationId}/title`, { title });
      setConversations((current) => current.map((c) => c.id === conversationId ? { ...c, title: updated.title } : c));
      setEditingConvId(null);
      toast.success("Chat renamed");
    } catch {
      toast.error("Failed to rename chat");
    }
  }

  async function deleteConversation(conversationId: string) {
    if (streaming && conversationId === activeConvId) {
      toast.error("Wait for the current response to finish before deleting this chat");
      return;
    }
    if (!window.confirm("Delete this chat? This cannot be undone from the app.")) return;
    try {
      await api.delete(`/businesses/${businessId}/conversations/${conversationId}`);
      setConversations((current) => current.filter((c) => c.id !== conversationId));
      if (activeConvId === conversationId) newConversation();
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  }

  return (
    <div className="flex min-h-full" style={{ background: "var(--page-bg)" }}>
      {/* ── Conversation sidebar ── */}
      <div
        className="hidden md:flex flex-col w-56 flex-shrink-0"
        style={{ borderRight: "1px solid var(--line)", background: "var(--sidebar-bg)" }}
      >
        <div className="p-3" style={{ borderBottom: "1px solid var(--line)" }}>
          <Button variant="outline" size="sm" className="w-full" onClick={newConversation}>
            <Plus className="h-3.5 w-3.5" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loadingConvs ? (
            <div className="flex justify-center py-6"><Spinner size="sm" /></div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--subtle-fg)" }}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className="group relative rounded-lg text-xs transition-colors"
                style={activeConvId === c.id
                  ? { background: "var(--nav-active-bg)", color: "var(--nav-active-fg)" }
                  : { color: "var(--muted-fg)" }
                }
              >
                {editingConvId === c.id ? (
                  <div className="flex items-center gap-1 p-2">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void saveConversationTitle(c.id);
                        if (e.key === "Escape") setEditingConvId(null);
                      }}
                      aria-label="Chat title"
                      className="min-w-0 flex-1 rounded px-2 py-1 text-xs outline-none"
                      style={{
                        border: "1px solid var(--accent)",
                        background: "var(--surface-raised)",
                        color: "var(--page-fg)",
                      }}
                    />
                    <button onClick={() => void saveConversationTitle(c.id)} aria-label="Save chat title"
                      className="rounded p-1 transition-colors"
                      style={{ color: "var(--accent)" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingConvId(null)} aria-label="Cancel renaming chat"
                      className="rounded p-1 transition-colors"
                      style={{ color: "var(--muted-fg)" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveConvId(c.id)}
                      className="w-full px-3 py-2.5 pr-12 text-left transition-colors"
                      onMouseEnter={(e) => {
                        if (activeConvId !== c.id) (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                      }}
                      onMouseLeave={(e) => {
                        if (activeConvId !== c.id) (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)";
                      }}
                    >
                      <p className="font-medium line-clamp-1">{c.title}</p>
                      <p className="mt-0.5" style={{ color: "var(--subtle-fg)" }}>{formatRelativeTime(c.updatedAt)}</p>
                    </button>
                    <div className="absolute right-1 top-1 flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button onClick={() => startEditingConversation(c)} aria-label={`Rename ${c.title}`}
                        className="rounded p-1 transition-colors"
                        style={{ color: "var(--muted-fg)" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => void deleteConversation(c.id)} aria-label={`Delete ${c.title}`}
                        className="rounded p-1 transition-colors"
                        style={{ color: "var(--muted-fg)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"; }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div
          className="pl-14 pr-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 flex-shrink-0 lg:pl-4"
          style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)" }}
          >
            <img src="/logo.png" alt="Lumiqs AI" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--page-fg)" }}>AI Business Consultant</h2>
            <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Business context and decision playbook loaded</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 sm:px-6 sm:py-8">
          {messages.length === 0 && !streaming && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 overflow-hidden"
                  style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)" }}
                >
                  <img src="/logo.png" alt="Lumiqs AI" className="w-9 h-9 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--page-fg)", letterSpacing: "-0.02em" }}>
                  Your AI Business Consultant
                </h3>
                <p className="text-sm leading-6 max-w-sm mx-auto" style={{ color: "var(--muted-fg)" }}>
                  Ask me anything about your business. I have full context about your company, goals, and challenges.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left p-3.5 rounded-xl text-sm transition-all"
                    style={{ border: "1px solid var(--line)", background: "var(--surface)", color: "var(--muted-fg)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,70,229,0.25)";
                      (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)";
                      (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                      (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)";
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loadingMsgs && <div className="flex justify-center"><Spinner /></div>}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("group", msg.role === "user" ? "flex justify-end" : "max-w-3xl")}
              >
                {msg.role === "user" ? (
                  <div className="max-w-xl">
                    <div className="flex items-center justify-end gap-2 mb-1.5">
                      <span className="text-xs font-medium" style={{ color: "var(--muted-fg)" }}>You</span>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={{ background: "var(--accent-subtle)" }}
                      >
                        {user?.imageUrl
                          ? <img src={user.imageUrl} alt={user.fullName || "You"} className="h-full w-full object-cover" />
                          : <User className="h-3 w-3" style={{ color: "var(--accent)" }} />
                        }
                      </div>
                    </div>
                    <div className="user-message">
                      <p className="text-sm leading-relaxed" style={{ color: "var(--page-fg)" }}>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)" }}
                      >
                        <Bot className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--muted-fg)" }}>Lumiqs AI</span>
                    </div>
                    <div className="ai-message">
                      <div className="prose text-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                      <div className="flex items-center gap-1 mt-4 pt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity" style={{ borderTop: "1px solid var(--line)" }}>
                        <button
                          onClick={() => void copyMessage(msg)}
                          aria-label={copiedMessageId === msg.id ? "Response copied" : "Copy response"}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                          style={{ color: "var(--muted-fg)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--page-fg)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"; }}
                        >
                          {copiedMessageId === msg.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copiedMessageId === msg.id ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => saveInsight(msg.content)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                          style={{ color: "var(--muted-fg)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--page-fg)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"; }}
                        >
                          <Bookmark className="h-3.5 w-3.5" /> Save insight
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming response */}
          {streaming && streamingContent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)" }}
                >
                  <Bot className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--muted-fg)" }}>Lumiqs AI</span>
              </div>
              <div className="ai-message">
                <div className="prose text-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                  <span
                    className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-cursor"
                    style={{ background: "var(--accent)", borderRadius: "2px" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {streaming && !streamingContent && (
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)" }}
                >
                  <Bot className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--muted-fg)" }}>Lumiqs AI</span>
              </div>
              <div className="ai-message">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "var(--accent)", animationDelay: `${i * 0.15}s`, opacity: 0.6 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        {/* ── Input area ── */}
        <div
          className="px-3 py-3 sm:px-6 sm:py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}
        >
          <div className="max-w-3xl mx-auto w-full">
            <div
              className="flex gap-2 items-end rounded-xl p-2.5 sm:p-3 transition-all w-full"
              style={{
                border: "1px solid var(--line-strong)",
                background: "var(--surface-raised)",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(79,70,229,0.4)"
              }
              onBlurCapture={(e) =>
                (e.currentTarget as HTMLElement).style.borderColor =
                "var(--line-strong)"
              }
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI consultant anything..."
                rows={1}
                disabled={streaming}
                className="flex-1 min-w-0 w-full !h-auto !min-h-[44px] !max-h-[200px] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 resize-none pl-4 pr-0 py-2.5 text-sm leading-5 overflow-y-auto"
              />

              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                size="icon"
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10"
              >
                {streaming ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            <p
              className="text-xs text-center mt-1.5 hidden sm:block"
              style={{ color: "var(--subtle-fg)" }}
            >
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
