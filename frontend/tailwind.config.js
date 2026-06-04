/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // ── New Design System (DESIGN_BRIEF.md) ──
        navy:       { DEFAULT: '#010131', soft: '#0a0a4a' },
        blue:       { DEFAULT: '#5391D5', light: '#EAF2FC', mid: '#C5DEFA' },
        green:      { DEFAULT: '#00C896', bg: '#E6FAF5' },
        red:        { DEFAULT: '#FF4B6E', bg: '#FFF0F3' },
        bg:         '#F4F6FB',
        card:       '#FFFFFF',
        border:     '#E8ECF4',
        'text-1':   '#010131',
        'text-2':   '#5A6480',
        'text-3':   '#9AA3BD',

        // Icon color system
        'ic-red':      { bg: '#FFF0F3', fg: '#FF4B6E' },
        'ic-orange':   { bg: '#FFF5ED', fg: '#FF8A35' },
        'ic-blue':     { bg: '#EAF2FC', fg: '#5391D5' },
        'ic-amber':    { bg: '#FFF8E6', fg: '#F2A600' },
        'ic-navy':     { bg: '#EAEBF7', fg: '#010131' },
        'ic-purple':   { bg: '#F0EEFE', fg: '#7C5FDB' },
        'ic-green':    { bg: '#E6FAF5', fg: '#00C896' },
        'ic-teal':     { bg: '#E3F6F5', fg: '#00A8A0' },

        // ── Legacy colors (keep for existing pages) ──
        brand: {
          900: '#0a2f4e', 800: '#0f3d65', 700: '#145280', 600: '#1a6699',
          500: '#2080b8', 400: '#4fa0cc', 300: '#85bfdc', 200: '#b8d9ec',
          100: '#ddeef6', 50: '#f0f7fb',
        },
        teal: {
          900: '#04342c', 800: '#085041', 700: '#0c6651', 600: '#0f6e56',
          500: '#1d9e75', 400: '#3bbf92', 200: '#9fe1cb', 100: '#c8efe3', 50: '#e1f5ee',
        },
        amber: {
          900: '#412402', 800: '#633806', 700: '#7a4a0a', 600: '#854f0b',
          500: '#ba7517', 400: '#ef9f27', 200: '#fac775', 100: '#fde2b0', 50: '#faeeda',
        },
        violet: {
          900: '#26215c', 800: '#3c3489', 700: '#4740a3', 600: '#534ab7',
          400: '#7f77dd', 200: '#afa9ec', 100: '#cecbf6', 50: '#eeedfe',
        },
        coral: {
          900: '#4a1b0c', 800: '#712b13', 600: '#993c1d', 500: '#d85a30',
          200: '#f0997b', 100: '#f5c4b3', 50: '#faece7',
        },
        forest: { 800: '#27500a', 600: '#3b6d11', 400: '#639922', 200: '#c0dd97', 50: '#eaf3de' },
        danger: { 600: '#a32d2d', 400: '#e24b4a', 500: '#e24b4a', 100: '#f5c4c4', 50: '#fcebeb' },
        success: { 700: '#0c6651', 600: '#0f6e56', 500: '#1d9e75', 100: '#c8efe3', 50: '#e1f5ee' },
        warning: { 600: '#854f0b', 500: '#ba7517', 100: '#fde2b0', 50: '#faeeda' },
      },
      fontFamily: {
        head: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['9px', { lineHeight: '13px', letterSpacing: '0.04em' }],
        xs:   ['11px', { lineHeight: '16px' }],
        sm:   ['12px', { lineHeight: '17px' }],
        base: ['13px', { lineHeight: '19px' }],
        md:   ['14px', { lineHeight: '20px' }],
        lg:   ['16px', { lineHeight: '22px' }],
        xl:   ['18px', { lineHeight: '24px' }],
        '2xl':['22px', { lineHeight: '28px', letterSpacing: '-0.4px' }],
        '3xl':['26px', { lineHeight: '32px', letterSpacing: '-0.6px' }],
      },
      borderRadius: {
        sm:  '10px',
        DEFAULT: '12px',
        md:  '16px',
        lg:  '20px',
        xl:  '24px',
        '2xl':'28px',
        full:'9999px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(1,1,49,0.06), 0 1px 2px -1px rgba(1,1,49,0.04)',
        'card-hover': '0 8px 24px rgba(1,1,49,0.09)',
        sm: '0 1px 2px 0 rgba(1,1,49,0.05)',
        toggle: '0 2px 8px rgba(1,1,49,0.25)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'fade-up':    'fadeUp 0.4s ease both',
        'slide-in':   'slideIn 0.4s ease both',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
        'xp-fill':    'xpFill 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer':    'shimmer 2s ease-in-out infinite',
        'badge-pop':  'badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },               '100%': { opacity: '1' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { '0%': { opacity: '0', transform: 'translateX(12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseDot:  { '0%,100%': { opacity: '1' },           '50%': { opacity: '0.4' } },
        xpFill:    { '0%': { width: '0%' },                '100%': { width: 'var(--xp-width)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        badgePop:  { '0%': { transform: 'scale(0)' },      '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
