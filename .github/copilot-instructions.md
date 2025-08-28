# ComicStop Development Instructions

ComicStop is a React + Vite web application for managing PDF collections. It provides a clean interface for uploading and organizing PDF documents, particularly comic books and similar content.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Setup
- Node.js and npm are already available (Node v20.19.4, npm 10.8.2)
- Install dependencies: `npm install` -- takes ~6 seconds
- NEVER CANCEL: All commands below complete quickly (under 2 minutes), but always wait for completion

### Build and Development Commands
- **Lint code**: `npm run lint` -- takes <1 second, NEVER CANCEL
- **Build for production**: `npm run build` -- takes ~2 seconds, NEVER CANCEL  
- **Development server**: `npm run dev` -- starts immediately, serves on http://localhost:5173/
- **Preview production build**: `npm run preview` -- serves built files on http://localhost:4173/

### Manual Validation Requirements
**CRITICAL: After making ANY code changes, you MUST:**
1. Run `npm run build` to ensure it builds successfully
2. Start the dev server with `npm run dev` 
3. Navigate to http://localhost:5173/ in browser
4. Verify the page shows:
   - "ComicStop" branding in orange in the top navigation
   - "Upload" button (orange) and "Sign Up / Login" button (dark gray) in top right
   - "Welcome to ComicStop" heading
   - "Start by uploading your PDF collection." text
5. Test that both dev (`npm run dev`) and preview (`npm run preview`) modes work
6. ALWAYS run `npm run lint` before completing any changes

## Project Structure

### Key Directories and Files
```
/home/runner/work/comicstop/comicstop/
├── src/
│   ├── App.jsx                    # Main application component
│   ├── config.js                  # App configuration (API URLs, file types)
│   ├── components/
│   │   └── Navbar/               # Navigation component with CSS modules
│   │       ├── Navbar.jsx
│   │       └── Navbar.module.css
│   ├── theme/
│   │   └── tokens.js             # Design system tokens (colors, spacing)
│   └── index.css                 # Global styles and CSS variables
├── package.json                  # Dependencies and npm scripts
├── vite.config.js               # Vite configuration
├── eslint.config.js             # ESLint configuration
└── index.html                   # HTML entry point
```

### Common Development Tasks

**Adding new components:**
- Create in `src/components/[ComponentName]/`
- Use CSS modules (`.module.css` files) 
- Import design tokens from `src/theme/tokens.js`
- Follow existing patterns in `src/components/Navbar/`

**Styling:**
- Use CSS modules for component-specific styles
- Reference design tokens from `src/theme/tokens.js`
- Global styles and CSS variables are in `src/index.css`
- Color scheme: Orange (#FF6B2C) primary, gray scale, white backgrounds

**Configuration changes:**
- App settings in `src/config.js` (API URLs, file upload limits, supported types)
- Build config in `vite.config.js`
- Linting rules in `eslint.config.js`

## Important Notes

### No Test Infrastructure
- **This project currently has NO test suite**
- Do not attempt to run test commands - they will fail
- Manual browser testing is the primary validation method
- Always validate changes by running the application in browser

### No CI/CD Pipeline
- No GitHub Actions or workflows exist yet
- No automated deployment scripts
- All validation must be done locally
- Focus on manual testing and linting

### Technology Stack
- **React 19.1.1** with hooks and modern patterns
- **Vite 7.1.3** for build tooling and dev server  
- **ESLint 9.33.0** for code linting
- **CSS Modules** for component styling
- **No testing framework** currently configured

## Validation Checklist
Before completing any work:
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully  
- [ ] `npm run dev` starts and serves working app
- [ ] Browser shows correct ComicStop UI at localhost:5173
- [ ] Navigation bar displays properly with correct styling
- [ ] `npm run preview` works with production build
- [ ] No console errors in browser developer tools

## Quick Reference Commands
```bash
# Setup (run once)
npm install

# Development workflow
npm run lint        # <1 second - check code style
npm run build       # ~2 seconds - build for production  
npm run dev         # Start dev server on localhost:5173
npm run preview     # Start preview server on localhost:4173

# Manual testing
# 1. Visit http://localhost:5173/
# 2. Verify ComicStop branding and buttons appear
# 3. Check console for errors
```