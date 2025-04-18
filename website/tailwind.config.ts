import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '820px',
        md: '640px',
        lg: '719px',
        mob: '1025px',
        xl: '1185px',
      },
      colors: {
        'dpl-white': '#e7ecef',
        'dpl-black': '#1D1D1D',
        'dark-bg': '#1B1B1B',
        content: '#FFFFFF',
        pureWhite: '#FFFFFF',
        backgroundDark: '#1D1D1D',
        stroke: '#303030',
        accent: '#DB504A',
        yellow: '#FFDC82',
        'content-black': '#272727',
        'gray-light': '#d3dce6',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '15': '15px',
        '20': '20px',
        '40': '40px',
        '10': '10px',
        '30': '30px',
        '25': '25px',
      },
      borderRadius: {
        '6xl': '10px',
        '50xl': '50%',
      },
      width: {
        '277': '277px',
        '571': '571px',
        '193': '193px',
      },
      gap: {
        '40': '35px',
        '20': '20px',
        '32': '32px',
        '40tab': '40px',
        '10': '10px',
        '45': '45px',
        '17': '17px',
      },
      maxWidth: {
        mwLg: '748px',
        mwMobSub: '60%',
        mw80: '80%',
      },
      order: {
        '0': '0',
        '1': '1',
        '2': '2',
      },
    },
  },
  plugins: [],
};
export default config;
