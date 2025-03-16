# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Configuration Files

### components.json

The `components.json` file configures how the shadcn/ui component library is integrated into the project. shadcn/ui is a collection of reusable UI components built with Tailwind CSS and React.

Key settings:
- `style`: UI style variant (default, new-york, etc.)
- `rsc`: React Server Components setting (disabled)
- `tsx`: Using JSX instead of TSX (not using TypeScript)
- `tailwind`: Configuration for Tailwind CSS integration
- `aliases`: Import path aliases for components
- `iconLibrary`: Icon library used (Lucide)

Reference: https://ui.shadcn.com/docs/installation

### jsconfig.json

The `jsconfig.json` file configures the JavaScript language service in Visual Studio Code and other editors that support it:

- `baseUrl`: Sets the base directory for resolving non-relative module names
- `paths`: Configures path aliases for imports, allowing you to use `@/` to reference files in the `src` directory

This configuration allows you to use imports like `import Component from '@/components/Component'` instead of relative paths like `import Component from '../../components/Component'`.

Reference: https://code.visualstudio.com/docs/languages/jsconfig
