/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        mint: "#2f9e7e",
        saffron: "#d79a2b",
        coral: "#c85b5b",
        ocean: "#2563eb",
        plum: "#7c3aed",
        night: "#101820",
        cloud: "#f8fafc"
      }
    }
  },
  plugins: []
};
