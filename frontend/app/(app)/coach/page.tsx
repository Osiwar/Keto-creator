"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Flame, Sparkles } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "What can I eat if I'm still hungry after dinner?",
  "Why am I not losing weight on keto?",
  "How do I deal with keto flu?",
  "What are the best foods for hitting my protein goal?",
  "Can I drink coffee on carnivore?",
  "How do I calculate net carbs?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: "var(--accent)" }}
        >
          <Flame className="w-4 h-4 text-white" fill="white" />
        </div>
      )}
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={isUser ? {
          background: "var(--accent-light)",
          border: "1px solid var(--accent)",
          color: "var(--accent-dark)",
          borderTopRightRadius: "4px",
        } : {
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          borderTopLeftRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {message.streaming && message.content === "" ? (
          <div className="flex gap-1 items-center py-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: message.content
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\n/g, "<br/>")
                .replace(/^- (.+)/gm, "• $1"),
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm your KetoCoach AI. I know your profile and macros, so ask me anything about your keto or carnivore journey. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const token = localStorage.getItem("keto_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, session_id: sessionId }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.session_id) setSessionId(parsed.session_id);
            if (parsed.delta) {
              fullText += parsed.delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullText, streaming: true };
                return updated;
              });
            }
            if (parsed.error) {
              fullText = `⚠️ Error: ${parsed.error}`;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullText, streaming: false };
                return updated;
              });
            }
          } catch {}
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: fullText, streaming: false };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't connect. Make sure your Anthropic API key is configured.",
          streaming: false,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent)" }}
        >
          <Flame className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <h1 className="font-bold" style={{ color: "var(--text)" }}>KetoCoach AI</h1>
          <p className="text-xs flex items-center gap-1" style={{ color: "#10B981" }}>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" /> Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, i) => (
          <MessageBubble key={i} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3">
          <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Sparkles className="w-3 h-3" /> Try asking
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="px-6 py-4 flex-shrink-0"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your keto coach anything..."
              rows={1}
              style={{
                resize: "none",
                background: "var(--bg-alt)",
                border: "1.5px solid var(--border)",
                color: "var(--text)",
                borderRadius: "16px",
                padding: "12px 16px",
                width: "100%",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{
              background: input.trim() && !loading ? "var(--accent)" : "var(--border)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
