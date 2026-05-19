# B01: Project Bootstrap

## Overview

This block contains the step-by-step instructions for bootstrapping the development environment, tooling, and foundational folder structure for the **KYLYVNYK CLUB** project. 

The process is divided into modular steps to ensure a robust, scalable, and maintainable foundation, leveraging modern web development tools and best practices.

## Steps

1. **[01. Init Next.js, TS, ESLint, Prettier](./01-init-nextjs-ts-eslint-prettier.md)**
   Initialize a Next.js 15 project (App Router) with TypeScript, ESLint, and Prettier. Includes setup for import sorting and clean code rules.

2. **[02. Vercel & Environment Setup](./02-vercel-env-setup.md)**
   Prepare environment variables templates (`.env.example`), minimal runtime environment configuration, and Vercel configuration stubs.

3. **[03. TSConfig Path Aliases](./03-tsconfig-path-aliases.md)**
   Enable absolute imports (`@/*`), strict TypeScript mode flags, and ambient types setup.

4. **[04. Tailwind CSS Setup](./04-tailwind-setup.md)**
   Install and configure Tailwind CSS, defining the initial black & gold design tokens via CSS variables.

5. **[05. shadcn/ui Setup](./05-shadcn-setup.md)**
   Scaffold baseline UI components using `shadcn/ui` aligned with the project's design tokens and Radix UI.

6. **[06. DX Tooling (Husky, commitlint)](./06-dx-tooling-husky-commitlint.md)**
   Enforce code quality and formatting via pre-commit hooks and Conventional Commits using Husky, `lint-staged`, and `commitlint`.

7. **[07. Folders Structure](./07-folders-structure.md)**
   Establish a scalable, feature-first folder layout for routing, UI components, business logic, and infrastructure modules.

## Overall Acceptance Criteria

Upon completion of this block:
- The Next.js application runs successfully locally.
- TypeScript, ESLint, and Prettier are strictly enforcing code quality, formatting, and type safety, catching errors pre-commit.
- Tailwind CSS and `shadcn/ui` components render correctly, respecting the dark/gold theme tokens.
- Git commits adhere to Conventional Commits standards.
- Environment variables are safely structured.
- The project follows a clear, scalable feature-first directory structure ready for further development.
