/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paytm: {
          cyan: "#00BAF2",
          blue: "#1769E0",
          navy: "#10264A",
          bg: "#F5F8FC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          muted: "#64748B",
          success: "#16A36A",
          warning: "#F2A900",
          danger: "#E5484D"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
