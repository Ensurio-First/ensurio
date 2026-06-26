module.exports = {
  content: ['./src/prototype/**/*.{js,jsx}'],
  corePlugins: { preflight: false }, // avoid resetting existing styles
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0C1F4F', 50: '#EEF1F9', 100: '#D4DCF0', 700: '#0C1F4F', 800: '#091847', 900: '#060E2B' },
        teal: { DEFAULT: '#0EA472', 50: '#E6F7F2', 100: '#C2EBD9', 500: '#0EA472', 600: '#0B8D62', 700: '#097A55' },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
