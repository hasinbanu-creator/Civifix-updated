/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#06B6D4",
        accent: "#FF9500",
        dark: "#1F2937",
        light: "#6B7280",
        border: "#E5E7EB",
        bg: "#F9FAFB",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
