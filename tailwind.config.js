// /** @type {import('tailwindcss').Config} */
// // export default {
// //   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
// //   darkMode: 'class',
// //   theme: {
// //     extend: {
// //       colors: {
// //         dark: {
// //           primary: '#0F0F23',
// //           secondary: '#1A1A2E',
// //           tertiary: '#16213E',
// //           accent: '#2A1B5D',
// //           purple: '#6366F1',
// //           text: '#E5E7EB',
// //           muted: '#9CA3AF'
// //         }
// //       }
// //     },
// //   },
// //   plugins: [],
// // };





/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
       backgroundImage: {
        'custom-gradient': 'linear-gradient(147deg, #ffffff09, #ffffff4a, #ffffff09)',
      },
      colors: {
        purplebg:'#6200ee',
        'white-31':'#ffffff50',
        dark: {
          primary: '#13072e',
          secondary: '#1A1A2E',
          tertiary: '#13072e',
          accent: '#2d2652',
          purple: '#0a0236',
          text: '#E5E7EB',
          muted: '#9CA3AF'
        }
      }
    },
  },
  plugins: [],
};