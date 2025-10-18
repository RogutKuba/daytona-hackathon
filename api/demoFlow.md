# Demo Flow - Daytona Hackathon

## Overview
This hackathon project uses Daytona sandboxes to spawn multiple instances of a Next.js commerce application for A/B testing and experimentation.

## Target Repository
- **Repository**: https://github.com/RogutKuba/nextjs-sample-commerce
- **Type**: Next.js App Router ecommerce application
- **Framework**: React Server Components, Server Actions, Suspense, useOptimistic

## Application Details

### Package.json Configuration
```json
{
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "prettier": "prettier --write --ignore-unknown .",
    "prettier:check": "prettier --check --ignore-unknown .",
    "test": "pnpm prettier:check"
  },
  "dependencies": {
    "@headlessui/react": "^2.2.0",
    "@heroicons/react": "^2.2.0",
    "clsx": "^2.1.1",
    "geist": "^1.3.1",
    "next": "15.3.0-canary.13",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "sonner": "^2.0.1"
  },
  "devDependencies": {
    "@tailwindcss/container-queries": "^0.1.1",
    "@tailwindcss/postcss": "^4.0.14",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "22.13.10",
    "@types/react": "19.0.12",
    "@types/react-dom": "19.0.4",
    "postcss": "^8.5.3",
    "prettier": "3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "tailwindcss": "^4.0.14",
    "typescript": "5.8.2"
  }
}
```

## Demo Flow Steps

1. **Sandbox Creation**: Daytona creates isolated sandboxes
2. **Repository Clone**: Clone the Next.js commerce repo into each sandbox
3. **Dependency Installation**: Run `pnpm install` to install dependencies
4. **Application Startup**: Run `pnpm dev` to start the development server
5. **Experiment Execution**: Run A/B tests across multiple sandbox instances
6. **Data Collection**: Gather metrics and results from each variant
7. **Analysis**: Compare performance and user behavior across variants

## Key Features for Hackathon
- **Hard-coded Repository**: No need to worry about server startup - the repo is pre-configured
- **Multiple Instances**: Spawn many sandboxes for parallel testing
- **Commerce Focus**: E-commerce application perfect for conversion rate testing
- **Modern Stack**: Uses latest Next.js features for optimal performance

## Development Commands
- **Development**: `pnpm dev` (uses Turbopack for fast builds)
- **Production Build**: `pnpm build`
- **Production Start**: `pnpm start`
- **Code Formatting**: `pnpm prettier`
