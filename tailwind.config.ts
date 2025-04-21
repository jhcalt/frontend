import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/routes/**/*.{js,jsx,ts,tsx}",
    "./app/root.{js,jsx,ts,tsx}",
    "./app/components/**/*.{js,jsx,ts,tsx}",
    "./app/layouts/**/*.{js,jsx,ts,tsx}",
    "./app/pages/**/*.{js,jsx,ts,tsx}",
    "./app/src/**/*.{js,jsx,ts,tsx}",
    "./app/entry.{client,server}.{js,ts}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#254bf1",
        "secondary": "#ff3153",
        "background": "#fefdfa",
        "grey": "#1f2937",
        "accent": "#c1faff",
        "card": "#ffffff7e",
        "card-hover": "#f9fafb",
        "popover": "#ffffff",
        "muted": "#f3f4f6",
        "muted-foreground": "#9ca3af",
        "destructive": "#e63946",
        "border": "#e5e7eb",
        "input": "#e5e7eb",
        "ring": "#1f2937",
        "icon": "#1e293b",
        "lilac": "#E98AF0",
        "portage": "#8A8FF0",
        "sulu": "#8AF096",
        "khaki": "#ECF08A",
        "tacao": "#F0B28A",
        "spray": "#8AE4F0",
        "purple": "#8A2BE2",
        "button": {
          "primary": "#254bf1",
          "secondary": "#f3f4f6"
        },
        "chart": {
          "1": "#ff8243",
          "2": "#26a69a",
          "3": "#2d4f73",
          "4": "#f6d365",
          "5": "#ffc857"
        }
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        tiempos: ['Tiempos', 'serif'],
        gotham: ['Gotham', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      spacing: {
        '0': '0px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-subtle": "bounce-subtle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-in": "spring-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "spring-out": "spring-out 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-in-up": "slide-in-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-in-down": "slide-in-down 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-out": "fade-out 0.3s ease-in-out",
        "pulse-once": "pulse-once 0.75s cubic-bezier(0.24, 0, 0.38, 1)",
        "shake": "shake 0.4s cubic-bezier(.36,.07,.19,.97) both",
        "yellow-glow": "yellow-glow 2.5s ease-in-out infinite",
        "green-glow": "green-glow 1s ease-in-out infinite",
        "red-glow": "red-glow 2s ease-in-out infinite",
        "red-glow-sm": "red-glow-sm 0.75s ease-in-out infinite",
        "lilac-glow": "lilac-glow 2s ease-in-out infinite",
        "lilac-glow-sm": "lilac-glow-sm 1s ease-in-out infinite",
        "portage-glow": "portage-glow 2s ease-in-out infinite",
        "portage-glow-sm": "portage-glow-sm 1s ease-in-out infinite",
        "sulu-glow": "sulu-glow 2s ease-in-out infinite",
        "sulu-glow-sm": "sulu-glow-sm 1s ease-in-out infinite",
        "khaki-glow": "khaki-glow 2s ease-in-out infinite",
        "khaki-glow-sm": "khaki-glow-sm 1s ease-in-out infinite",
        "tacao-glow": "tacao-glow 2s ease-in-out infinite",
        "tacao-glow-sm": "tacao-glow-sm 1s ease-in-out infinite",
        "spray-glow": "spray-glow 2s ease-in-out infinite",
        "spray-glow-sm": "spray-glow-sm 1s ease-in-out infinite",
        "pink-glow": "pink-glow 2s ease-in-out infinite",
        "pink-glow-sm": "pink-glow-sm 1s ease-in-out infinite",
        "orange-glow": "orange-glow 2s ease-in-out infinite",
        "orange-glow-sm": "orange-glow-sm 1s ease-in-out infinite",
        "purple-glow": "purple-glow 2s ease-in-out infinite",
        "purple-glow-sm": "purple-glow-sm 1s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5%)" },
        },
        "spring-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "spring-out": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(0.98)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "pulse-once": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "yellow-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 15px 2px rgba(246, 211, 101, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 25px 5px rgba(246, 211, 101, 0.4)"
          }
        },
        "green-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 15px 2px rgba(34, 197, 94, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 25px 5px rgba(34, 197, 94, 0.4)"
          }
        },
        "red-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 15px 2px rgba(239, 68, 68, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 25px 5px rgba(239, 68, 68, 0.4)"
          }
        },
        "red-glow-sm": {
          "0%, 100%": {
            "box-shadow": "0 0 7px 1px rgba(239, 68, 68, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 10px 3px rgba(239, 68, 68, 0.4)"
          }
        },
        "lilac-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #E98AF0" },
          "50%": { boxShadow: "0 0 40px #E98AF0" }
        },
        "lilac-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #E98AF0" },
          "50%": { boxShadow: "0 0 14px #E98AF0" }
        },
        "portage-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #8A8FF0" },
          "50%": { boxShadow: "0 0 40px #8A8FF0" }
        },
        "portage-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #8A8FF0" },
          "50%": { boxShadow: "0 0 14px #8A8FF0" }
        },
        "sulu-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #8AF096" },
          "50%": { boxShadow: "0 0 40px #8AF096" }
        },
        "sulu-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #8AF096" },
          "50%": { boxShadow: "0 0 14px #8AF096" }
        },
        "khaki-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #ECF08A" },
          "50%": { boxShadow: "0 0 40px #ECF08A" }
        },
        "khaki-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #ECF08A" },
          "50%": { boxShadow: "0 0 14px #ECF08A" }
        },
        "tacao-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #F0B28A" },
          "50%": { boxShadow: "0 0 40px #F0B28A" }
        },
        "tacao-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #F0B28A" },
          "50%": { boxShadow: "0 0 14px #F0B28A" }
        },
        "spray-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #8AE4F0" },
          "50%": { boxShadow: "0 0 40px #8AE4F0" }
        },
        "spray-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #8AE4F0" },
          "50%": { boxShadow: "0 0 14px #8AE4F0" }
        },
        "purple-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #8A2BE2" },
          "50%": { boxShadow: "0 0 40px #8A2BE2" }
        },
        "purple-glow-sm": {
          "0%, 100%": { boxShadow: "0 0 7px #8A2BE2" },
          "50%": { boxShadow: "0 0 14px #8A2BE2" }
        },
        "pink-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 15px 2px rgba(255, 192, 203, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 25px 5px rgba(255, 192, 203, 0.4)"
          }
        },
        "pink-glow-sm": {
          "0%, 100%": {
            "box-shadow": "0 0 7px 1px rgba(255, 192, 203, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 14px 3px rgba(255, 192, 203, 0.4)"
          }
        },
        "orange-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 15px 2px rgba(255, 165, 0, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 25px 5px rgba(255, 165, 0, 0.4)"
          }
        },
        "orange-glow-sm": {
          "0%, 100%": {
            "box-shadow": "0 0 7px 1px rgba(255, 165, 0, 0.2)"
          },
          "50%": {
            "box-shadow": "0 0 14px 3px rgba(255, 165, 0, 0.4)"
          }
        },
        "shimmer": {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'scale': 'transform',
        'spring': 'transform, opacity',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'out-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      containers: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
      },
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],
        'lg-mobile': ['1.125rem', { lineHeight: '1.75rem' }],
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/container-queries')
  ],
} satisfies Config;