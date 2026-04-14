/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#07111f',
          elevated: '#0c1728',
          panel: '#101c31',
          subtle: '#17233a',
        },
        accent: {
          DEFAULT: '#68e1fd',
          strong: '#2dd4bf',
          warm: '#f59e0b',
          rose: '#fb7185',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(3, 10, 23, 0.45)',
        glow: '0 0 0 1px rgba(104, 225, 253, 0.2), 0 20px 40px rgba(13, 148, 136, 0.18)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top left, rgba(104, 225, 253, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.12), transparent 30%)',
        'contribution-grid': 'linear-gradient(180deg, rgba(104, 225, 253, 0.18), rgba(104, 225, 253, 0.02))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};