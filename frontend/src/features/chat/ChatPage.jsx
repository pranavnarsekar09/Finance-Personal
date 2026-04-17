import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
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
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
      <PageHeader
        eyebrow="AI Assistant"
        title="Chat with your data."
        description="Ask anything about your spending, budget, or nutrition."
      />

      <Card className="flex flex-col flex-1 mt-6 overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-xl">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 flex gap-3 ${
                    msg.role === "user"
                      ? "bg-cyan-500/20 text-cyan-50 border border-cyan-500/30"
                      : "bg-white/5 text-slate-200 border border-white/10"
                  }`}
                >
                  <div className="shrink-0 mt-1">
                    {msg.role === "user" ? (
                      <div className="bg-cyan-500/20 p-1 rounded-lg text-cyan-300">
                        <User size={14} />
                      </div>
                    ) : (
                      <div className="bg-white/10 p-1 rounded-lg text-white">
                        <Bot size={14} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  // Trigger handleSend manually or just set input
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-slate-900/80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your budget, spending..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
