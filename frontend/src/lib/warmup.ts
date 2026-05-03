import { API_BASE_URL } from "./constants";

let warmupStarted = false;

export function warmBackend() {
  if (warmupStarted || !API_BASE_URL) {
    return;
  }

  warmupStarted = true;

  const ping = () =>
    fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      cache: "no-store",
      keepalive: true,
    }).catch(() => undefined);

  void ping();

  if (typeof window !== "undefined") {
    window.setInterval(() => {
      void ping();
    }, 4 * 60 * 1000);
  }
}
