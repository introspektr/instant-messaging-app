/**
 * PostCSS Configuration File
 * 
 * PostCSS is a tool for transforming CSS with JavaScript plugins.
 * This configuration file defines the plugins that will process our CSS.
 * 
 * Plugins used:
 * - tailwindcss: Processes Tailwind CSS directives and generates utility classes
 * - autoprefixer: Automatically adds vendor prefixes to CSS rules for better browser compatibility
 */
export default {
  plugins: {
    tailwindcss: {},  // Processes @tailwind directives and generates utility classes
    autoprefixer: {}, // Adds necessary vendor prefixes (-webkit, -moz, etc.) based on browserslist
  },
}
