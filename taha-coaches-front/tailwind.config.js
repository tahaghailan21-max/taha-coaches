/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {

      colors: {

        //Original color pallete
        // primary: '#8A7650',      // Main headers, buttons, links
        // secondary: '#6F7B60',    // Darker green for better contrast on surface
        // background: '#ECE7D1',   // Page background
        // surface: '#DBCEA5',      // Cards, panels
        // accent: '#C79D4B',      //for highlights
        // info: '#6A8D8A',        // Muted teal, earthy and cohesive
        // danger: '#C94C4C',       // Red for errors/warnings
        //
        // // Dark mode (optional: prefixed or via class strategy)
        // dark: {
        //   background: '#1E1A15',
        //   surface: '#322C23',
        //   primary: '#D9C4A7',
        //   secondary: '#A1A78D',
        //   accent: '#E5B85F',
        //   info: '#70907F',
        //   danger: '#C8655B'
        // }

        //pro black and white and blue
//         primary: '#4A4A4A',       // Dark gray for headers, links, buttons
//         secondary: '#6B7280',     // Medium gray for secondary text and subtle elements
//         background: '#F5F5F5',    // Light neutral background
//         surface: '#FFFFFF',       // Card/panel surfaces
//         accent: '#2563EB',        // Professional blue for highlights/CTA
//         info: '#3B82F6',          // Muted blue for info/messages
//         danger: '#DC2626',        // Red for errors/warnings
//
// // Dark mode
//         dark: {
//           background: '#121212',   // Almost black
//           surface: '#1F1F1F',      // Dark gray panels
//           primary: '#E5E5E5',      // Light gray text
//           secondary: '#A3A3A3',    // Medium gray text
//           accent: '#3B82F6',       // Same blue accent
//           info: '#60A5FA',         // Lighter muted blue
//           danger: '#EF4444'        // Strong red
//         }
//
        // earthy color palette
        primary: '#4B3F2F',      // Dark brown for headers, links, buttons
        secondary: '#6D5E4B',    // Medium taupe for secondary text or subtle UI elements
        background: '#F5F2EA',   // Soft beige background
        surface: '#E8E2D6',      // Light warm surface for cards/panels
        accent: '#A17C4B',       // Muted golden-brown highlight
        info: '#7F9C8C',          // Earthy muted teal/green for info
        danger: '#B74A4A',        // Muted brick red for errors/warnings

// Dark mode
        dark: {
          background: '#1E1A16',  // Dark earthy brown
          surface: '#2F2A24',     // Dark panel surface
          primary: '#E0D8C7',     // Light beige text
          secondary: '#B8AA99',   // Softer beige for secondary text
          accent: '#C49B6C',      // Warm gold accent
          info: '#88A08C',        // Muted teal for info
          danger: '#D36C6C'       // Slightly brighter muted red
        }




      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

