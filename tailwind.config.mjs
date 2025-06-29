/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{astro,js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // 品牌主色系
                primary: {
                    50: '#f0f0f4',   // 極淺
                    100: '#e1e2e9',  // 很淺
                    200: '#c3c5d3',  // 淺
                    300: '#a5a8bd',  // 中淺
                    400: '#878ba7',  // 中
                    500: '#676f9d',  // 淺色主色
                    600: '#525a83',  // 中深
                    700: '#424669',  // 次淡主色
                    800: '#353a56',  // 深
                    900: '#2d3250',  // 主色
                    950: '#1f2238',  // 極深
                },

                // 點綴色系 (橘色系)
                accent: {
                    50: '#fef9f3',   // 極淺橘
                    100: '#fef2e6',  // 很淺橘
                    200: '#fde5cc',  // 淺橘
                    300: '#fcd8b3',  // 中淺橘
                    400: '#fbcb99',  // 中橘
                    500: '#f8b179',  // 點綴複副色
                    600: '#f69d5a',  // 中深橘
                    700: '#f4893b',  // 深橘
                    800: '#e6742a',  // 很深橘
                    900: '#cc5f1c',  // 極深橘
                    950: '#a64d17',  // 最深橘
                },

                // 中性色系 (基於主色調整)
                neutral: {
                    50: '#f8f9fa',   // 白色調
                    100: '#f1f3f4',  // 極淺灰
                    200: '#e3e5e8',  // 很淺灰
                    300: '#d1d5db',  // 淺灰
                    400: '#9ca3af',  // 中淺灰
                    500: '#6b7280',  // 中灰
                    600: '#4b5563',  // 中深灰
                    700: '#374151',  // 深灰
                    800: '#2d3748',  // 很深灰
                    900: '#1f2937',  // 極深灰
                    950: '#0f172a',  // 黑色調
                },

                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },

                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },

                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    950: '#450a0a',
                },

                info: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },

                brand: {
                    DEFAULT: '#2d3250',
                    light: '#676f9d',
                    dark: '#2d3250',
                    accent: '#f8b179',
                },
            },

            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                serif: ['ui-serif', 'Georgia', 'serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
                chinese: ['Noto Sans TC', 'sans-serif'],
                english: ['Merriweather', 'serif'],
            },

            boxShadow: {
                'brand-sm': '0 1px 2px 0 rgba(45, 50, 80, 0.05)',
                'brand': '0 1px 3px 0 rgba(45, 50, 80, 0.1), 0 1px 2px 0 rgba(45, 50, 80, 0.06)',
                'brand-md': '0 4px 6px -1px rgba(45, 50, 80, 0.1), 0 2px 4px -1px rgba(45, 50, 80, 0.06)',
                'brand-lg': '0 10px 15px -3px rgba(45, 50, 80, 0.1), 0 4px 6px -2px rgba(45, 50, 80, 0.05)',
                'brand-xl': '0 20px 25px -5px rgba(45, 50, 80, 0.1), 0 10px 10px -5px rgba(45, 50, 80, 0.04)',
                'accent': '0 4px 6px -1px rgba(248, 177, 121, 0.2), 0 2px 4px -1px rgba(248, 177, 121, 0.1)',
            },

            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #2d3250 0%, #424669 50%, #676f9d 100%)',
                'accent-gradient': 'linear-gradient(135deg, #f8b179 0%, #f69d5a 100%)',
                'hero-gradient': 'linear-gradient(135deg, #2d3250 0%, #676f9d 50%, #f8b179 100%)',
            },
        },
    },
    plugins: [],
}
