/**
 * Service Worker Registration for PWA
 * Handles offline functionality and caching strategies
 */

export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("✓ Service Worker registered successfully", registration);

          // Check for updates periodically (every hour)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error("✗ Service Worker registration failed:", error);
        });
    });

    // Listen for controller change (SW update)
    let refreshing: boolean;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      console.log("✓ Service Worker updated, reloading app...");
      window.location.reload();
    });
  }
}

/**
 * Request periodic background sync (optional)
 * Useful for syncing data in the background
 */
export async function enableBackgroundSync() {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register("sync-data");
      console.log("✓ Background sync enabled");
    } catch (error) {
      console.error("✗ Background sync registration failed:", error);
    }
  }
}

/**
 * Check if app is online or offline
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline status changes
 */
export function onOnlineStatusChange(callback: (isOnline: boolean) => void) {
  window.addEventListener("online", () => callback(true));
  window.addEventListener("offline", () => callback(false));
}
