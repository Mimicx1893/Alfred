/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gotham: { black: '#0a0a0f', dark: '#10131a', panel: '#121824', border: '#273244', text: '#c8d1dc', muted: '#718096', accent: '#00d4ff', success: '#00ff88', warning: '#ffaa00', danger: '#ff4444' },
        batCyan: '#00d4ff',
      },
      fontFamily: { hud: ['"Courier New"', 'monospace'], butler: ['Georgia', 'serif'] },
      boxShadow: { glow: '0 0 24px rgba(0, 212, 255, 0.12)' },
    },
  },
  plugins: [],
};
