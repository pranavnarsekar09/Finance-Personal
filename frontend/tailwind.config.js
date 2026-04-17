/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#0f1117",
        card: "rgba(21, 28, 43, 0.7)",
        accent: "#22d3ee",
        accent2: "#3bff9f",
        ink: "#e5f4ff",
        muted: "#8ca3b8",
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
          "radial-gradient(circle at top left, rgba(34, 211, 238, 0.15), transparent 30%), radial-gradient(circle at top right, rgba(59, 255, 159, 0.14), transparent 30%), linear-gradient(160deg, #0f1117 0%, #111827 55%, #09121c 100%)",
      },
    },
  },
  plugins: [],
};
