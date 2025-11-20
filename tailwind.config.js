export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css}"
  ],
  theme: { extend: {} },
  variants: {
    extend: {
      backgroundImage: ['dark'],
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}
