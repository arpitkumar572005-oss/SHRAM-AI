/** @type {import('tailwind-css').Config} */
export default {
  darkMode: 'class', // Prevent system OS dark mode from overriding light green-and-white theme
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shramForest: {
          DEFAULT: '#064E3B', // Deep Forest Green Primary
          dark: '#043A2B',
          light: '#08634B',
        },
        shramEmerald: {
          DEFAULT: '#16A34A', // Primary CTA Emerald Green
          hover: '#15803D',   // Dark Green Hover
          light: '#ECFDF5',   // Soft Light Green
          border: '#A7F3D0',
        },
        shramLime: {
          DEFAULT: '#84CC16', // Accent Lime Green
          light: '#F7FEE7',
        },
        shramBg: '#F8FAF9',       // Off-White Page Background
        shramCard: '#FFFFFF',     // White Cards
        shramBorder: '#D1D5DB',   // Soft Gray-Green Border
        shramText: {
          DEFAULT: '#12372A',     // Main Text Dark Forest
          secondary: '#475569',  // Secondary Text Dark Slate Gray for high contrast
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Devanagari"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
