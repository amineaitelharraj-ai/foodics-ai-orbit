/** @type {import('tailwindcss').Config} */
import fdxTailwind from '@foodics/ui-common/plugins/tailwind.config.js';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../../packages/labeeb-chat/src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@foodics/ui-common/**/*.{vue,js,ts,jsx,tsx}',
  ],
  presets: [fdxTailwind],
  theme: {
    extend: {
      colors: {
        foodics: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
};
