const defaultTheme = require('tailwindcss/defaultTheme');

// noinspection JSUnresolvedVariable
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
            screens: {
                'xs': '475px',
            }
        },
    },
    plugins: []
};
