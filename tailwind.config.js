/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/components/**/*.{js,jsx,ts,tsx}","./Layout.{js,jsx,ts,tsx}","app\components"], 
  theme: {
    extend: {
      colors: {
        customColor1: '#A0DFD6',
      },
      borderRadius: {
        'top': '0px 0px 0 0', // Custom border-radius for top corners
      },
    },
  },
  plugins: [],
}

