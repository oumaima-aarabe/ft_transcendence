import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
	"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			sans: ['Poppins', 'sans-serif'],
		  },
		keyframes: {
			paddles: {
			  "0%": { boxShadow: "-25px -10px, 25px 10px" },
			  "50%": { boxShadow: "-25px 8px, 25px -10px" },
			  "100%": { boxShadow: "-25px -10px, 25px 10px" },
			},
			ballbounce: {
			  "0%": { transform: "translateX(-20px) scale(1, 1.2)" },
			  "25%": { transform: "scale(1.2, 1)" },
			  "50%": { transform: "translateX(15px) scale(1, 1.2)" },
			  "75%": { transform: "scale(1.2, 1)" },
			  "100%": { transform: "translateX(-20px)" },
			},
		  },
		  animation: {
			paddles: "paddles 0.75s ease-out infinite",
			ballbounce: "ballbounce 0.6s ease-out infinite",
		},
		boxShadow: {
			'shd': '0px 4px 6.2px rgba(208, 95, 59, 1)',
		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			'global-background': "url('/assets/images/background.jpg')",
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
