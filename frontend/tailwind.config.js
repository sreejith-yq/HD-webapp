/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#5ce1e6', // Cyan
                    dark: '#4bc8cd',
                    light: '#e6fafb',
                },
                highlight: {
                    DEFAULT: '#180f63', // Navy
                    light: '#2a1f8a',
                },
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'squircle-sm': '14px',
                'squircle-md': '14px',
                'squircle-lg': '16px',
                'squircle-xl': '24px',
            },
        },
    },
    plugins: [],
}
