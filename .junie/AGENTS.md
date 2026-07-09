# Project Development Information

This document provides essential information for advanced developers working on the website project.

## Build and Configuration

### Prerequisites
- **Node.js**: `^26.0.0` (as per `package.json`)
- **pnpm**: `^11.0.0` (as per `package.json`)
- **Docker**: For local services (MongoDB, Redis, Storage)

### Setup
1. **Environment Variables**: Copy `.env.example` to `.env.local` and fill in the required secrets.
2. **Local Services**: Run `docker compose up -d` to start the required services:
   - **MongoDB**: `localhost:27017`
   - **Redis**: `localhost:6379`
   - **S3 Storage (RustFS/Minio)**: `localhost:9000` (API), `localhost:9001` (Console)
3. **Install Dependencies**: `pnpm install`
4. **Generate Artifacts**:
   - `pnpm generate:types`: Generates Payload types to `src/types/payload.ts`.
   - `pnpm generate:importmap`: Generates the admin import map.
   - `pnpm generate`: Runs both in parallel.
5. **Development**: `pnpm dev` starts the Next.js development server.

### Key Configuration Files
- `payload.config.ts`: Main Payload CMS configuration.
- `next.config.ts`: Next.js configuration with Payload integration.
- `docker-compose.yml`: Local infrastructure setup.
- `biome.json`: Linting and formatting rules (Biome).

## Testing

The project uses the built-in Node.js test runner for unit tests.

### Running Tests
- Run all tests: `node --test`
- Run a specific test: `node --test tests/filename.test.js`

### Adding New Tests
Tests should be written as ESM modules. Place them in the `tests/` directory or co-locate them with source files using the `.test.js` suffix.

#### Example Test (ESM)
```javascript
// tests/math.js
export function add(a, b) {
  return a + b;
}

// tests/math.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from './math.js';

test('add two numbers', () => {
  assert.equal(add(1, 2), 3);
});
```

### Demonstration Test
A sample test was created and verified:
- `tests/sample.js`: Exported a `multiply` function.
- `tests/sample.test.js`: Verified `multiply(2, 3) === 6` and `multiply(5, 0) === 0`.
The test was executed using `/opt/homebrew/bin/node --test tests/sample.test.js` and passed successfully.

## Additional Development Information

### Code Style and Linting
- **Formatter/Linter**: The project uses **Biome**. Use `pnpm lint` to check and `pnpm format` to apply formatting.
- **Rules**: Configured in `biome.json`. Notable rules include:
  - Indent style: `space` (2 spaces)
  - Quotes: `single` (double for JSX)
  - Semicolons: `asNeeded`
  - Import organization: Automatically grouped by Biome.

### Tech Stack Highlights
- **Framework**: Next.js 15
- **CMS**: Payload CMS 3.x
- **Database**: MongoDB (via Mongoose)
- **KV Store**: Redis
- **Storage**: S3-compatible (via `@payloadcms/storage-s3`)
- **Styles**: Tailwind CSS 4 (using `@tailwindcss/postcss`)

### Environment Validation
The project uses `zod` to validate environment variables in `src/types/environment.ts`. This ensures that all required variables are present and correctly formatted at startup.
