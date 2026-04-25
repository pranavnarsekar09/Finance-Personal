import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";

export function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your FinTrack AI assistant. I have access to your budget, recent spending, and nutrition logs. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { response } = await api.chat(USER_ID, userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How much did I spend this month?",
    "What's my biggest expense category?",
    "How many calories have I eaten today?",
    "Can I afford a $50 dinner tonight?",
  ];

  return (
    <div className="page-shell flex h-[calc(100vh-12rem)] flex-col md:h-[calc(100vh-8rem)]">
      <PageHeader
        eyebrow="AI Assistant"
        title="Chat with your data."
        description="Ask anything about your spending, budget, or nutrition."
      />

      <Card className="mt-6 flex flex-1 flex-col overflow-hidden">
        <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "border border-sky-200 bg-sky-500 text-white"
                      : "border border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {msg.role === "user" ? (
                      <div className="rounded-lg bg-white/20 p-1 text-white">
                        <User size={14} />
                      </div>
                    ) : (
                      <div className="rounded-lg bg-white p-1 text-slate-700">
                        <Bot size={14} />
                      </div>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            </motion.div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 ? (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your budget, spending..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 rounded-xl bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
