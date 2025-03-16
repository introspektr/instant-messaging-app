/**
 * Tailwind CSS Configuration File
 * 
 * This file configures Tailwind CSS, a utility-first CSS framework.
 * It defines the project's design system including:
 * - Color palette with CSS variables
 * - Theme customization
 * - Responsive design breakpoints
 * - Plugins and extensions
 */

/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
    darkMode: 'class',                     // Enable dark mode with the 'class' strategy (using .dark class)
    content: ['./src/**/*.{js,jsx,ts,tsx}'], // Files to scan for class names to include in the final CSS
    
    theme: {
        extend: {
            // Border radius values using CSS variables for consistency
            borderRadius: {
                lg: 'var(--radius)',                 // Large radius
                md: 'calc(var(--radius) - 2px)',     // Medium radius
                sm: 'calc(var(--radius) - 4px)'      // Small radius
            },
            
            // Color system using CSS variables (HSL format)
            // This enables theme switching and consistent colors across components
            colors: {
                // Base colors
                background: 'hsl(var(--background))',      // Main background color
                foreground: 'hsl(var(--foreground))',      // Main text color
                
                // Component-specific colors
                card: {
                    DEFAULT: 'hsl(var(--card))',           // Card background
                    foreground: 'hsl(var(--card-foreground))' // Card text color
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',        // Popover background
                    foreground: 'hsl(var(--popover-foreground))' // Popover text color
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',        // Primary button/accent color 
                    foreground: 'hsl(var(--primary-foreground))' // Text on primary color
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',      // Secondary button/accent color
                    foreground: 'hsl(var(--secondary-foreground))' // Text on secondary color
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',          // Muted background (for de-emphasized content)
                    foreground: 'hsl(var(--muted-foreground))' // Muted text color
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',         // Accent color for highlights
                    foreground: 'hsl(var(--accent-foreground))' // Text on accent color
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',    // Destructive action color (delete, error)
                    foreground: 'hsl(var(--destructive-foreground))' // Text on destructive color
                },
                
                // Border and input colors
                border: 'hsl(var(--border))',              // Border color for UI elements
                input: 'hsl(var(--input))',                // Input field border color
                ring: 'hsl(var(--ring))',                  // Focus ring color
                
                // Chart color palette for data visualizations
                chart: {
                    '1': 'hsl(var(--chart-1))',            // First chart color
                    '2': 'hsl(var(--chart-2))',            // Second chart color
                    '3': 'hsl(var(--chart-3))',            // Third chart color
                    '4': 'hsl(var(--chart-4))',            // Fourth chart color
                    '5': 'hsl(var(--chart-5))'             // Fifth chart color
                },
                
                // Direct color values (not using CSS variables)
                darkBackground: '#1a1a1a',                 // Dark mode background fallback
                darkForeground: '#e0e0e0',                 // Dark mode text fallback
                darkAccent: '#007bff',                     // Dark mode accent fallback
            }
        }
    },
    
    plugins: [tailwindcssAnimate],         // Add animation utilities from tailwindcss-animate plugin
}