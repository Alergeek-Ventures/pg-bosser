# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pg-bosser is a TypeScript wrapper around [pg-boss](https://github.com/timgit/pg-boss) that provides end-to-end type
safety for PostgreSQL-backed job queues. The library consists of three main components that work together:

- **BossClient**: Singleton pattern for managing the pg-boss connection
- **Queue**: Type-safe wrapper for creating and managing job queues
- **Worker**: Event-driven worker implementation with type safety

## Architecture

### Core Components

**BossClient** (`src/BossClient.ts`):

- Singleton that manages the pg-boss instance
- Handles PostgreSQL connection using environment variables
- Uses `pgboss` schema for job storage
- Required env vars: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_DB`

**Queue** (`src/Queue.ts`):

- Generic class providing type safety for job payloads
- Automatically creates dead letter queues (DLQ) with `-dlq` suffix
- Supports standard send, debounced send, and scheduled jobs
- Manages queue creation and configuration

**Worker** (`src/Worker.ts`):

- Event-driven worker with EventEmitter pattern
- Emits `done` and `error` events for job lifecycle management
- Type-safe callback interface matching queue payload types
- Automatic error handling and event emission

### Key Design Patterns

1. **Singleton Pattern**: BossClient ensures single pg-boss instance
2. **Generic Types**: Queue<IPayload> and Worker<IPayload> enforce type safety
3. **Auto-DLQ**: Queues automatically create dead letter queues unless explicitly disabled
4. **Event-Driven**: Workers use EventEmitter for extensible job lifecycle handling

## Development Commands

### Setup

```bash
pnpm install
```

### Building

```bash
# Build library for distribution
pnpm run build

# Build in watch mode for development
pnpm run dev

# Type check without emitting files
pnpm run typecheck
```

### Code Quality

```bash
# Format staged files
pnpm run fmt:staged

# Format all files (direct prettier)
npx prettier --write "**/*.{js,ts,md}"
```

### Publishing

```bash
# Prepare for publishing (runs typecheck + build)
pnpm run prepublishOnly
```

## Environment Setup

Required environment variables for PostgreSQL connection:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_DB`

## Usage Pattern

1. Define typed queue: `new Queue<PayloadType>({ name: "queue-name" })`
2. Create worker: `new Worker({ queue, callback })`
3. Set up event handlers: `worker.on("done"|"error", handler)`
4. Start worker: `await worker.work()`
5. Send jobs: `await queue.send(payload)`

The library automatically handles queue creation, DLQ setup, and pg-boss lifecycle management.

## Library Distribution

This package is configured as a library using Vite:

- **ESM**: `./dist/pg-bosser.es.js`
- **CJS**: `./dist/pg-bosser.cjs.js`
- **Types**: `./dist/index.d.ts`

The build outputs both ES modules and CommonJS formats with TypeScript declarations for maximum compatibility. External
dependencies (pg-boss, events) are properly externalized to avoid bundling conflicts.

## Local Development Usage

To use this library locally in other projects during development, you can use pnpm's file protocol:

### 1. Build the library

```bash
pnpm run build
```

### 2. Install in target project

```bash
# In your target project directory
pnpm add file:../path/to/pg-bosser

# Or with absolute path
pnpm add file:/Users/username/path/to/pg-bosser
```

### 3. Use in your project

```typescript
import { Queue, Worker, BossClient } from "pg-bosser";

// Your code here...
```

### 4. Updating during development

When you make changes to the library:

```bash
# In pg-bosser directory
pnpm run build

# In your target project directory
pnpm update pg-bosser
```

**Note:** The file protocol creates a symlink to the local package, so you need to rebuild the library (
`pnpm run build`) whenever you make changes for them to be reflected in consuming projects.
