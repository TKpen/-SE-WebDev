export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css}"
  ],
  theme: { extend: {} },
  plugins: [require('tailwind-scrollbar-hide')],
}
