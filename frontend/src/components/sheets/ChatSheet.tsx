import { useState } from "react";
import { Sparkles, Send, Paperclip, Mic } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useChat } from "@/hooks/useApi";
import { toast } from "sonner";

const suggestions = [
  "How's my spending this week?",
  "How much did I save this month?",
  "What is my calorie goal?",
];

export function ChatSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "bot"; content: string }>>([]);
  const chatMutation = useChat();

  const handleSend = async (text?: string) => {
    const content = text || msg;
    if (!content.trim()) return;

    const userMsg = { role: "user" as const, content };
    setHistory((prev) => [...prev, userMsg]);
    setMsg("");

    try {
      const response = await chatMutation.mutateAsync(content);
      setHistory((prev) => [...prev, { role: "bot", content: response.response }]);
    } catch (error: any) {
      toast.error("Failed to chat with Zeni");
      console.error(error);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Ask Zeni</span>
      </div>
      
      {history.length === 0 ? (
        <>
          <h2 className="font-display text-3xl font-bold leading-tight mb-2">
            Ask me anything about your health or wealth
          </h2>
          <p className="text-muted-foreground text-sm mb-5">
            I can analyze your spending patterns, track your goals, or give health advice.
          </p>
          <div className="mt-7">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Suggestions</span>
            </div>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button 
                  key={s} 
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-sm py-2.5 px-1 border-b border-border/60 flex justify-between items-center hover:text-primary transition-colors"
                >
                  <span>{s}</span><span className="text-muted-foreground">↗</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-h-[40vh] overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
          {history.map((h, i) => (
            <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm ${h.role === "user" ? "bg-surface-dark text-white rounded-tr-none" : "bg-secondary rounded-tl-none"}`}>
                {h.content}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-[1.5rem] rounded-tl-none p-4 text-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
          <span>AI Insight active</span>
          <button className="text-primary font-medium">Powered by Gemini</button>
        </div>
        <div className="bg-secondary rounded-full p-2 flex items-center gap-2 border border-border/50">
          <div className="h-9 w-9 rounded-full bg-gradient-mint flex-shrink-0 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <input
            value={msg} 
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything…"
            className="flex-1 bg-transparent outline-none text-sm py-2"
          />
          <button onClick={() => handleSend()} disabled={chatMutation.isPending} className="h-9 w-9 rounded-full bg-surface-dark flex items-center justify-center text-white disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
