/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.{js,html}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#c7f000",
          foreground: "#0b1f33",
        },
        brand: {
          background: "#f6f8fa",
          foreground: "#2e3133",
          muted: "#66707a",
          border: "#dce3e8",
          card: "#ffffff",
          primary: "#0b1f33",
          secondary: "#12263a",
          dark: "#071522",
        },
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', "Inter", "sans-serif"],
        display: ["Manrope", '"Noto Sans Thai"', "sans-serif"],
        sans: ["Inter", '"Noto Sans Thai"', "sans-serif"],
      },
      borderRadius: {
        brand: "1.25rem",
        "brand-lg": "1.5rem",
        "brand-xl": "1.75rem",
      },
      boxShadow: {
        brand: "0 18px 40px rgba(11, 31, 51, 0.08)",
        accent: "0 10px 24px rgba(199, 240, 0, 0.25)",
      },
      maxWidth: {
        container: "1180px",
      },
    },
  },
  plugins: [],
};
