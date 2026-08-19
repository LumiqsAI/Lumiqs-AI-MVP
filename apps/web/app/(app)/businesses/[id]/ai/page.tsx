"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Plus, Bot, User, Copy, RefreshCw, Bookmark, Trash2, MessageSquare,
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
  const api = useApiClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
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
      setMessages(conv.messages?.filter((m) => m.role !== "SYSTEM") || []);
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

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || "",
      role: "USER",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/businesses/${businessId}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
            if (data.delta) {
              fullContent += data.delta;
              setStreamingContent(fullContent);
            }
            if (data.error) streamError = data.error;
            if (data.done) {
              // Reload conversations to get new one
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
          if (data.delta) {
            fullContent += data.delta;
            setStreamingContent(fullContent);
          }
        } catch { /* ignore an incomplete terminal event */ }
      }

      if (streamError) throw new Error(streamError);
      if (!fullContent.trim()) throw new Error("The AI provider returned an empty response");

      // Add assistant message to state
      const assistantMsg: Message = {
        id: `temp-ai-${Date.now()}`,
        conversationId: newConvId || "",
        role: "ASSISTANT",
        content: fullContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
    } catch (err) {
      toast.error("AI response failed. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, activeConvId, businessId, getToken, api]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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

  function newConversation() {
    setActiveConvId(null);
    setMessages([]);
  }

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="hidden md:flex flex-col w-56 border-r border-white/8 bg-slate-950/50">
        <div className="p-3 border-b border-white/8">
          <Button variant="outline" size="sm" className="w-full" onClick={newConversation}>
            <Plus className="h-3.5 w-3.5" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                  activeConvId === c.id ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <p className="font-medium line-clamp-1">{c.title}</p>
                <p className="text-slate-600 mt-0.5">{formatRelativeTime(c.updatedAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-white/8 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Lumiqs AI" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Business Consultant</h2>
            <p className="text-xs text-slate-500">Business context and decision playbook loaded</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !streaming && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img src="/logo.png" alt="Lumiqs AI" className="w-10 h-10 object-contain" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Your AI Business Consultant</h3>
                <p className="text-sm text-slate-400">Ask me anything about your business. I have full context about your company, goals, and challenges.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left p-3 rounded-lg border border-white/8 hover:border-indigo-500/30 hover:bg-indigo-600/5 text-sm text-slate-400 hover:text-white transition-all"
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
                className={cn("flex gap-3 max-w-3xl", msg.role === "USER" ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden",
                  msg.role === "USER" ? "bg-indigo-600/30" : "bg-slate-800",
                )}>
                  {msg.role === "USER" ? <User className="h-3.5 w-3.5 text-indigo-300" /> : <img src="/logo.png" alt="Lumiqs" className="w-5 h-5 object-contain" />}
                </div>
                <div className={cn(
                  "flex-1 min-w-0",
                  msg.role === "USER" ? "bg-indigo-600/15 border border-indigo-500/20 rounded-2xl rounded-tr-sm px-4 py-3" : "",
                )}>
                  {msg.role === "USER" ? (
                    <p className="text-sm text-white">{msg.content}</p>
                  ) : (
                    <div className="prose text-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  {msg.role === "ASSISTANT" && (
                    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1.5 rounded hover:bg-white/5 text-slate-600 hover:text-slate-400 transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => saveInsight(msg.content)} className="p-1.5 rounded hover:bg-white/5 text-slate-600 hover:text-slate-400 transition-colors">
                        <Bookmark className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming */}
          {streaming && streamingContent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-3xl">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                <img src="/logo.png" alt="Lumiqs" className="w-5 h-5 object-contain" />
              </div>
              <div className="flex-1 prose text-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                <span className="inline-block w-1.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
              </div>
            </motion.div>
          )}

          {streaming && !streamingContent && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/logo.png" alt="Lumiqs" className="w-5 h-5 object-contain" />
              </div>
              <div className="flex items-center gap-1 py-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/8 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-indigo-500/50 transition-colors">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI consultant anything..."
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[44px] max-h-[200px] p-0 text-sm"
                rows={1}
                disabled={streaming}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                size="icon"
                className="flex-shrink-0"
              >
                {streaming ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}
