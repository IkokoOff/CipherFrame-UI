/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan:    '#00f5ff',
          cyan2:   '#00c8d7',
          cyan3:   '#006680',
          magenta: '#ff00aa',
          yellow:  '#ffd700',
          red:     '#ff2050',
          green:   '#00ff88',
          bg:      '#020408',
          panel:   '#040c14',
        }
      },
      fontFamily: {
        mono:    ['"Share Tech Mono"', 'monospace'],
        orb:     ['"Orbitron"', 'monospace'],
        raj:     ['"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 12px rgba(0,245,255,0.5), 0 0 40px rgba(0,245,255,0.12)',
        'glow-mag':  '0 0 12px rgba(255,0,170,0.5), 0 0 30px rgba(255,0,170,0.12)',
        'glow-grn':  '0 0 10px rgba(0,255,136,0.4), 0 0 30px rgba(0,255,136,0.1)',
      },
      animation: {
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
        'glitch1':    'g1 4s infinite',
        'glitch2':    'g2 4s infinite',
        'fade-in':    'fadeIn 0.3s forwards',
      },
      keyframes: {
        pulseDot: { '0%,100%':{ opacity:1, transform:'scale(1)' }, '50%':{ opacity:0.3, transform:'scale(0.7)' } },
        fadeIn:   { to:{ opacity:1 } },
      }
    }
  },
  plugins: []
}
