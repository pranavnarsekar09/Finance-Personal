import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "./lib/pwa";
import { warmBackend } from "./lib/warmup";

// Register Service Worker for PWA functionality
registerSW();
warmBackend();

createRoot(document.getElementById("root")!).render(<App />);
