/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Add your Modern Minimalist colors to existing palette
      colors: {
        // Modern Minimalist Palette
        'primary': '#A6A3A7',
        'secondary': '#DCCBC7', 
        'accent': '#766667',
        'neutral': '#F4F4F4',
        'text-main': '#363636',
        
        // Override existing color mappings
        'gray-50': '#F4F4F4',    // Neutral
        'gray-100': '#F4F4F4',   // Neutral
        'gray-200': '#DCCBC7',   // Secondary
        'gray-300': '#DCCBC7',   // Secondary  
        'gray-400': '#A6A3A7',   // Primary
        'gray-500': '#A6A3A7',   // Primary
        'gray-600': '#766667',   // Accent
        'gray-700': '#766667',   // Accent
        'gray-800': '#363636',   // Text
        'gray-900': '#363636',   // Text
        
        // Override blue colors to your palette
        'blue-50': '#F4F4F4',
        'blue-100': '#F4F4F4',
        'blue-200': '#DCCBC7',
        'blue-300': '#DCCBC7',
        'blue-400': '#A6A3A7',
        'blue-500': '#A6A3A7',
        'blue-600': '#766667',
        'blue-700': '#766667',
        'blue-800': '#363636',
        'blue-900': '#363636',
        
        // Override purple colors to your palette
        'purple-50': '#F4F4F4',
        'purple-100': '#F4F4F4',
        'purple-200': '#DCCBC7',
        'purple-300': '#DCCBC7',
        'purple-400': '#A6A3A7',
        'purple-500': '#A6A3A7',
        'purple-600': '#766667',
        'purple-700': '#766667',
        'purple-800': '#363636',
        'purple-900': '#363636',
      }
    },
  },
  plugins: [],
}
