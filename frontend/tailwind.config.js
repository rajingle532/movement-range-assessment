/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#2563EB',
        'medical-blue-dark': '#1D4ED8',
        'medical-cyan': '#06B6D4',
        'medical-light': '#F0F4F8',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
