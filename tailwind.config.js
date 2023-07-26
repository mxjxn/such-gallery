/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
			animation: {
				fadeIn: "fadeIn 0.5s ease-in-out",
			},
			keyframes: {
				fadeIn: {
				 "0%": { opacity: 0 },
				"100%": { opacity: 1 },
				},
			},
      colors: {
        "doge-yellow": "#ffce00",
        "doge-brown": "#6a4935",
        "doge-light-yellow": "#ffecb3",
        "doge-white": "#ffffff",
      },
      margin: {
        "1/5": "20%",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("daisyui")],
};
