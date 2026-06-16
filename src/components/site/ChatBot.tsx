"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, ExternalLink } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
interface QuickReply {
  label: string;
  action: string;
  payload?: string;
}
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  quickReplies?: QuickReply[];
}
interface ChatData {
  faqs: FaqItem[];
  whatsappNumber: string | null;
  brandName: string;
}

// ── Keyword matching ─────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","be","been","have","has","had","do",
  "does","did","will","would","shall","should","can","could","of","at","by",
  "for","with","about","to","from","in","out","on","off","how","what","when",
  "where","why","who","which","this","that","these","those","i","me","my","we",
  "our","you","your","he","she","it","they","them","their","not","and","or","but",
]);

function matchFaq(input: string, faqs: FaqItem[]): FaqItem | null {
  const tokens = input
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (tokens.length === 0) return null;

  let bestScore = 0;
  let bestFaq: FaqItem | null = null;
  for (const faq of faqs) {
    const text = `${faq.question} ${faq.answer}`.toLowerCase();
    const hits = tokens.filter((t) => text.includes(t)).length;
    const score = hits / tokens.length;
    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }
  return bestScore >= 0.35 ? bestFaq : null;
}

function getCategories(faqs: FaqItem[]): string[] {
  return [...new Set(faqs.map((f) => f.category))];
}

// ── Message factory ──────────────────────────────────────────────────────────

let nextId = 0;
function msg(
  content: string,
  isUser: boolean,
  quickReplies?: QuickReply[],
): Message {
  return { id: String(++nextId), content, isUser, quickReplies };
}

// ── Component ────────────────────────────────────────────────────────────────

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [data, setData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch FAQ data on first open
  useEffect(() => {
    if (!open || data) return;
    setLoading(true);
    fetch("/api/faq")
      .then((r) => r.json())
      .then((d: ChatData) => {
        setData(d);
        if (d.faqs.length === 0) {
          setMessages([
            msg("Hi! 👋 We don't have FAQ content yet, but feel free to reach out:", false, [
              { label: "Send an Enquiry", action: "link", payload: "/propose" },
              ...(d.whatsappNumber
                ? [{ label: "Chat on WhatsApp", action: "whatsapp" }]
                : []),
            ]),
          ]);
          return;
        }
        const cats = getCategories(d.faqs);
        setMessages([
          msg(
            `Hi! 👋 I'm the ${d.brandName} assistant. How can I help you today?`,
            false,
            [
              ...cats.map((c) => ({ label: c, action: "category", payload: c })),
              { label: "Contact Us", action: "contact" },
            ],
          ),
        ]);
      })
      .catch(() =>
        setMessages([
          msg("Sorry, I'm having trouble loading. Please try again later.", false),
        ]),
      )
      .finally(() => setLoading(false));
  }, [open, data]);

  // Auto-scroll + focus
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (open && !loading) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open, loading]);

  // ── Bot reply helper ───────────────────────────────────────────────────────

  const reply = useCallback(
    (content: string, quickReplies?: QuickReply[]) => {
      setTimeout(
        () => setMessages((prev) => [...prev, msg(content, false, quickReplies)]),
        350,
      );
    },
    [],
  );

  const homeReplies = useCallback((): QuickReply[] => {
    if (!data) return [];
    return [
      ...getCategories(data.faqs).map((c) => ({
        label: c,
        action: "category",
        payload: c,
      })),
      { label: "Contact Us", action: "contact" },
    ];
  }, [data]);

  // ── Quick reply handler ────────────────────────────────────────────────────

  const handleQuickReply = useCallback(
    (qr: QuickReply) => {
      if (!data) return;
      setMessages((prev) => [...prev, msg(qr.label, true)]);

      switch (qr.action) {
        case "category": {
          const items = data.faqs.filter((f) => f.category === qr.payload);
          if (items.length === 0) {
            reply("No questions in that category yet. Try typing your question!");
            return;
          }
          reply(
            `Here are some questions about **${qr.payload}**:`,
            [
              ...items.slice(0, 6).map((f) => ({
                label: f.question.length > 60 ? f.question.slice(0, 57) + "…" : f.question,
                action: "faq",
                payload: f.id,
              })),
              { label: "← Back to topics", action: "home" },
            ],
          );
          break;
        }
        case "faq": {
          const faq = data.faqs.find((f) => f.id === qr.payload);
          if (faq) {
            reply(faq.answer, [
              { label: "Browse more topics", action: "home" },
              { label: "Contact Us", action: "contact" },
            ]);
          }
          break;
        }
        case "contact": {
          const opts: QuickReply[] = [];
          if (data.whatsappNumber)
            opts.push({ label: "Chat on WhatsApp", action: "whatsapp" });
          opts.push({ label: "Send an Enquiry", action: "link", payload: "/propose" });
          opts.push({ label: "Call Us", action: "link", payload: "/contact" });
          opts.push({ label: "← Back to topics", action: "home" });
          reply(
            "I'd love to connect you with our team! How would you like to reach us?",
            opts,
          );
          break;
        }
        case "whatsapp":
          if (data.whatsappNumber) {
            window.open(
              `https://wa.me/${data.whatsappNumber.replace(/\D/g, "")}`,
              "_blank",
            );
          }
          break;
        case "link":
          if (qr.payload) window.location.href = qr.payload;
          break;
        case "home":
          reply("What would you like to know about?", homeReplies());
          break;
      }
    },
    [data, reply, homeReplies],
  );

  // ── Text input handler ─────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const q = input.trim();
    if (!q || !data) return;
    setInput("");
    setMessages((prev) => [...prev, msg(q, true)]);

    const match = matchFaq(q, data.faqs);
    if (match) {
      reply(match.answer, [
        { label: "Browse more topics", action: "home" },
        { label: "Contact Us", action: "contact" },
      ]);
    } else {
      reply(
        "I couldn't find a specific answer for that. Let me help you another way:",
        [
          { label: "Browse topics", action: "home" },
          { label: "Contact Us", action: "contact" },
        ],
      );
    }
  }, [input, data, reply]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with us"}
        className={`fixed bottom-6 right-[88px] z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          open
            ? "bg-muted text-foreground scale-90"
            : "bg-primary text-primary-foreground hover:scale-110 active:scale-95"
        }`}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[min(500px,calc(100vh-120px))] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">
                  {data?.brandName ?? "Vraman"} Assistant
                </p>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                  Online
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
              {loading && (
                <div className="flex gap-1.5 justify-center py-10">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-2.5 w-2.5 rounded-full bg-primary/30 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              )}

              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[88%] space-y-2">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        m.isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.quickReplies && m.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.quickReplies.map((qr) => (
                          <button
                            key={qr.label}
                            onClick={() => handleQuickReply(qr)}
                            className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors"
                          >
                            {(qr.action === "whatsapp" || qr.action === "link") && (
                              <ExternalLink className="h-3 w-3" />
                            )}
                            {qr.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t px-3 py-2.5 shrink-0 bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  disabled={loading || !data}
                  className="flex-1 h-10 rounded-full border bg-muted/50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading || !data}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
