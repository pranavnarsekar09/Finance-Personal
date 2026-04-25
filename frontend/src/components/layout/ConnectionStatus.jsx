import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../lib/constants";

export function ConnectionStatus() {
  const [status, setStatus] = useState("connecting"); // connecting, waking, connected, error
  const [lastCheck, setLastCheck] = useState(null);
  const pollIntervalRef = useRef(null);
  const wakingTimeoutRef = useRef(null);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStatus((prev) => {
          if (prev !== "connected") {
            // Switch to long-term heartbeat (5 mins) once connected
            // This prevents Render from sleeping without aggressive 5s polling
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = setInterval(checkConnection, 5 * 60 * 1000);
          }
          return "connected";
        });
        setLastCheck(new Date().toLocaleTimeString());
        clearTimeout(wakingTimeoutRef.current);
      } else {
        throw new Error("Server response not OK");
      }
    } catch (err) {
      setStatus((prev) => {
        if (prev === "connected") {
          // If we lost connection, resume fast polling to detect when it's back
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = setInterval(checkConnection, 5000);
          return "error";
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    // Initial connection check
    checkConnection();

    // Start aggressive 5s polling until first connection
    pollIntervalRef.current = setInterval(checkConnection, 5000);

    // Set 'waking' status if it takes more than 8 seconds (typical cold start detection)
    wakingTimeoutRef.current = setTimeout(() => {
      setStatus((prev) => (prev === "connecting" ? "waking" : prev));
    }, 8000);

    return () => {
      clearInterval(pollIntervalRef.current);
      clearTimeout(wakingTimeoutRef.current);
    };
  }, []);

  const config = {
    connecting: { color: "bg-rose-500", text: "Connecting to server...", pulse: true },
    waking: { color: "bg-amber-500", text: "Waking up server (Cold Start)...", pulse: true },
    connected: { color: "bg-emerald-500", text: "Server Online", pulse: false },
    error: { color: "bg-rose-600", text: "Server unreachable", pulse: true },
  };

  const current = config[status];

  return (
    <div className="connection-status-wrapper fixed top-6 right-6 z-[100]">
      <div className="group relative flex items-center gap-2">
        <div className="relative flex h-3 w-3">
          {current.pulse && (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${current.color} opacity-75`}></span>
          )}
          <span className={`relative inline-flex h-3 w-3 rounded-full ${current.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></span>
        </div>
        
        {/* Tooltip - Now appears below the dot since dot is at the top */}
        <div className="pointer-events-none absolute top-full right-0 mt-3 translate-y-[-8px] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="whitespace-nowrap rounded-xl border border-white/10 bg-slate-900/95 px-4 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/95">
            <div className="flex flex-col gap-1">
              <span className="font-bold">{current.text}</span>
              {lastCheck && (
                <span className="text-[10px] text-slate-400">Last active: {lastCheck}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
