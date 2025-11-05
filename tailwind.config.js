/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3C50E0',
          50: '#F0F2FE',
          100: '#E1E6FD',
          200: '#C3CDFB',
          300: '#A5B4F9',
          400: '#879BF7',
          500: '#3C50E0',
          600: '#3040B3',
          700: '#243086',
          800: '#18205A',
          900: '#0C102D',
        },
        meta: {
          1: '#DC3545',
          2: '#EFF2F7',
          3: '#10B981',
          4: '#313D4A',
          5: '#259AE6',
          6: '#FFBA00',
          7: '#FF6766',
          8: '#F0950C',
          9: '#E5E7EB',
          10: '#0FADCF',
        },
        success: '#10B981',
        danger: '#DC3545',
        warning: '#FFBA00',
        bodydark: '#AEB7C0',
        bodydark1: '#DEE4EE',
        bodydark2: '#8A99AF',
        strokedark: '#2E3A47',
        whiten: '#F1F5F9',
        whiter: '#F5F7FD',
        boxdark: '#24303F',
        'boxdark-2': '#1A222C',
        graydark: '#333A48',
      },
      animation: {
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
      keyframes: {
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
      },
      boxShadow: {
        default: '0px 8px 13px -3px rgba(0, 0, 0, 0.07)',
        card: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        'card-2': '0px 1px 2px rgba(0, 0, 0, 0.05)',
        switcher: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        'switch-1': '0px 0px 5px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
