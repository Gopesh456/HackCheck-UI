// tailwind.config.js
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|link|navbar|ripple|spinner).js",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golden: {
          light: "#FFD700",
          DEFAULT: "#DAA520",
          dark: "#B8860B",
        },
        dark: {
          lighter: "#2A2A2A",
          DEFAULT: "#1A1A1A",
          darker: "#121212",
        },
      },
    },
  },
  plugins: [
    heroui(),
    require("@tailwindcss/typography"),
    // ...your oth  er plugins
  ],
};
