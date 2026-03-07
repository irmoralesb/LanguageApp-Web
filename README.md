# LanguageApp-Web

React + Vite frontend for the Language App.

## Prerequisites

- **Node.js** 18.x or later (LTS recommended)
- **npm** (comes with Node.js)

## Installing dependencies

From the project root:

```bash
npm install
```

## Running the app

### Development server

Start the Vite dev server (with hot reload):

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (or the next free port if 5173 is in use).

### Production build

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Debugging

### In VS Code / Cursor

1. **Start the dev server** in a terminal: `npm run dev`.
2. **Start debugging**: press **F5** or use **Run > Start Debugging**.
3. Choose **Chrome** when prompted (or use the existing "Launch Chrome" configuration). The debugger will attach to the running app in Chrome.

If you don’t have a launch configuration yet, create `.vscode/launch.json` with:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach to Chrome",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

- **Launch Chrome**: starts Chrome and opens the app; breakpoints in your React/TS code will hit.
- **Attach to Chrome**: use if you start Chrome with remote debugging (`chrome.exe --remote-debugging-port=9222`).

### In the browser

Use **Chrome DevTools** (F12) for console, network, and sources. For breakpoints, use the **Sources** panel or the VS Code/Cursor debugger as above.

## Scripts

| Script     | Description                |
| ---------- | -------------------------- |
| `npm run dev`     | Start dev server (Vite)     |
| `npm run build`   | Production build            |
| `npm run preview` | Serve production build      |
| `npm run lint`    | Run ESLint                  |
