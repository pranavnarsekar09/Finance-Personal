/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#f5f7fb",
        card: "#ffffff",
        accent: "#0ea5e9",
        accent2: "#34d399",
        ink: "#0f172a",
        muted: "#64748b",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["Syne", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 40px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 30%), radial-gradient(circle at top right, rgba(167, 243, 208, 0.22), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #f5f7fb 45%, #eef4ff 100%)",
        app:
          "radial-gradient(circle at top left, rgba(125, 211, 252, 0.22), transparent 24%), radial-gradient(circle at top right, rgba(196, 181, 253, 0.16), transparent 26%), linear-gradient(180deg, #fbfdff 0%, #f5f7fb 55%, #eef3fb 100%)",
        "dark-app":
          "radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 22%), radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 24%), linear-gradient(180deg, #020617 0%, #0f172a 55%, #111827 100%)",
      },
    },
  },
  plugins: [],
};
