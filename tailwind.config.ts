import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1b527c',
                    light: '#55bff3',
                },
                secondary: {
                    DEFAULT: '#55bff3',
                },
                background: {
                    DEFAULT: '#f8fafc',
                    secondary: '#e2e8f0',
                },
                'text-primary': '#111827',
                'text-secondary': '#6b7280',
                border: {
                    DEFAULT: '#cbd5e1',
                },
                success: '#16a34a',
                danger: '#dc2626',
                warning: '#facc15',
                info: '#3b82f6',
                accent: {
                    1: '#2d9bf0',
                    2: '#0f6cbf',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
