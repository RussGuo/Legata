import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // v2 tokens
        fg: {
          primary: '#0C1321',
          secondary: '#3A4456',
        },
        bg: {
          canvas: '#F7F9FC',
          surface: '#FFFFFF',
        },
        accent: '#2F6BFF',
        'accent-weak': '#E8F0FF',
        success: '#2FB171',
        'success-bg': '#E9F8F1',
        warning: '#E6A700',
        'warning-bg': '#FFF7DB',
        danger: '#D64545',
        'danger-bg': '#FDECEC',
        line: '#E5E8EE',
        diff: {
          add: '#0E9F6E',
          'add-bg': '#ECFDF5',
          del: '#B42318',
          'del-bg': '#FEF3F2',
          mod: '#7C3AED',
          'mod-bg': '#F5F3FF',
        },
        cite: {
          a: '#2F6BFF',
          b: '#0E9F6E',
          c: '#7C3AED',
          d: '#E6A700',
        }
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'Roboto', 'Noto Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
        serif: ['ui-serif', 'Source Serif 4', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(12,19,33,0.05)',
        'elev-2': '0 8px 24px rgba(12,19,33,0.08)'
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      maxWidth: {
        container: '1200px',
        prose: '760px',
      }
    },
  },
  plugins: [],
} satisfies Config
