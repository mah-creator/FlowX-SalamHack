# flowx

A Vite + React + TypeScript workspace that combines a frontend UI (FlowX) with a mock API ready for role-based flows and local development. This repository is intended as a developer-friendly mock environment to prototype UI, auth/roles, and API interactions.

## Key Features

- Frontend built with Vite + React + TypeScript
- Component library and UI primitives under `src/app/components/ui`
- Role-aware mock API for local development
- Opinionated layout and core services in `src/core` and `src/services`

## Quick Start

Prerequisites: Node.js (v16+ recommended) and npm.

1. Install dependencies

   npm install

2. Start the development frontend

   npm run dev

3. Start the mock API server (if provided)

   npm run server

4. Build for production

   npm run build

5. Preview the production build

   npm run preview

If any of the above scripts are missing, inspect `package.json` for available commands.

## Project Structure (high level)

- `src/` — application source
  - `app/` — UI components and app-level primitives
  - `core/` — providers, feature modules, hooks, and services
  - `flowx/` — FlowX app entry and workspace pages
  - `services/` — API clients and service wrappers

Other important files:

- `index.html` — app entry
- `vite.config.ts` — Vite configuration
- `tsconfig.json` — TypeScript config

## Documentation & Deployment

See the repository documents for architecture and deployment notes:

- [FLOWX_README.md](FLOWX_README.md)
- [MOCK_API_READY_README.md](MOCK_API_READY_README.md)
- [README_DEPLOYMENT.md](README_DEPLOYMENT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)

## Contributing

Improve docs, add tests, or file issues. For code changes, open a PR with a clear description and small, focused commits.

## License

Project license not specified in this repo. Add a `LICENSE` file if you intend to open-source the project.
