
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				oswald: ['Oswald', 'sans-serif'],
				lato: ['Lato', 'sans-serif'],
				merriweather: ['Merriweather', 'serif'],
			},
			colors: {
				// palette principale - usando oggetti per supportare opacità
				sabbia: {
					DEFAULT: "#F4F1EA",
					50: "#F4F1EA",
					100: "#F4F1EA",
					200: "#F4F1EA",
					300: "#F4F1EA",
					400: "#F4F1EA",
					500: "#F4F1EA",
					600: "#F4F1EA",
					700: "#F4F1EA",
					800: "#F4F1EA",
					900: "#F4F1EA",
				},
				verdesalvia: {
					DEFAULT: "#7B8B6F",
					50: "#7B8B6F",
					100: "#7B8B6F",
					200: "#7B8B6F",
					300: "#7B8B6F",
					400: "#7B8B6F",
					500: "#7B8B6F",
					600: "#7B8B6F",
					700: "#7B8B6F",
					800: "#7B8B6F",
					900: "#7B8B6F",
				},
				ruggine: {
					DEFAULT: "#8B5E3C",
					50: "#8B5E3C",
					100: "#8B5E3C",
					200: "#8B5E3C",
					300: "#8B5E3C",
					400: "#8B5E3C",
					500: "#8B5E3C",
					600: "#8B5E3C",
					700: "#8B5E3C",
					800: "#8B5E3C",
					900: "#8B5E3C",
				},
				cemento: {
					DEFAULT: "#A9A9A9",
					50: "#A9A9A9",
					100: "#A9A9A9",
					200: "#A9A9A9",
					300: "#A9A9A9",
					400: "#A9A9A9",
					500: "#A9A9A9",
					600: "#A9A9A9",
					700: "#A9A9A9",
					800: "#A9A9A9",
					900: "#A9A9A9",
				},
				antracite: {
					DEFAULT: "#2E2E2E",
					50: "#2E2E2E",
					100: "#2E2E2E",
					200: "#2E2E2E",
					300: "#2E2E2E",
					400: "#2E2E2E",
					500: "#2E2E2E",
					600: "#2E2E2E",
					700: "#2E2E2E",
					800: "#2E2E2E",
					900: "#2E2E2E",
				},
				senape: {
					DEFAULT: "#D4A017",
					50: "#D4A017",
					100: "#D4A017",
					200: "#D4A017",
					300: "#D4A017",
					400: "#D4A017",
					500: "#D4A017",
					600: "#D4A017",
					700: "#D4A017",
					800: "#D4A017",
					900: "#D4A017",
				},
				bianco: {
					DEFAULT: "#ffffff",
					50: "#ffffff",
					100: "#ffffff",
					200: "#ffffff",
					300: "#ffffff",
					400: "#ffffff",
					500: "#ffffff",
					600: "#ffffff",
					700: "#ffffff",
					800: "#ffffff",
					900: "#ffffff",
				}
			},
			boxShadow: {
				'rustic-card': '0 2px 14px -2px #2E2E2E14, 0 1px 0 #ded9d3 inset',
				'cement-shadow': '0 1.5px 14px -4px #A9A9A944, 0 1px 0 #cccccc inset',
			},
			backgroundImage: {
				// texture cemento/parete realistica
				'cemento-texture': "url('https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=1000&q=30')",
				'mattone-texture': "url('https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=1000&q=40')",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
