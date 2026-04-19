import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../lib/constants";

export function ConnectionStatus() {
  const [status, setStatus] = useState("connecting"); // connecting, waking, connected, error
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let intervalId;
    let wakingTimeoutId;
    const startTime = Date.now();

    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setStatus("connected");
          // Hide after 3 seconds of being connected to keep UI clean
          setTimeout(() => setIsVisible(false), 3000);
          clearInterval(intervalId);
          clearTimeout(wakingTimeoutId);
        } else {
          throw new Error("Server response not OK");
        }
      } catch (err) {
        // If we haven't connected yet and it's been > 10s, set to waking
        if (Date.now() - startTime > 10000 && status !== "connected") {
          setStatus("waking");
        } else if (status === "connected") {
          // If we were connected but lost it
          setStatus("error");
          setIsVisible(true);
        }
      }
    };

    // Initial check
    checkConnection();

    // Poll every 5 seconds
    intervalId = setInterval(checkConnection, 5000);

    // Set waking status after 10s if still connecting
    wakingTimeoutId = setTimeout(() => {
      setStatus((prev) => (prev === "connecting" ? "waking" : prev));
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(wakingTimeoutId);
    };
  }, []);

  if (!isVisible) return null;

  const config = {
    connecting: { color: "bg-rose-500", text: "Connecting to server...", pulse: true },
    waking: { color: "bg-amber-500", text: "Waking up server (Cold Start)...", pulse: true },
    connected: { color: "bg-emerald-500", text: "Connected", pulse: false },
    error: { color: "bg-rose-600", text: "Server unreachable", pulse: true },
  };

  const current = config[status];

  return (
    <div className="connection-status-wrapper">
      <div className="group relative flex items-center gap-2">
        <div className="relative flex h-3 w-3">
          {current.pulse && (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${current.color} opacity-75`}></span>
          )}
          <span className={`relative inline-flex h-3 w-3 rounded-full ${current.color}`}></span>
        </div>
        
        {/* Tooltip */}
        <div className="pointer-events-none absolute right-full mr-3 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          <div className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl border border-white/10">
            {current.text}
          </div>
        </div>
      </div>
    </div>
  );
}
