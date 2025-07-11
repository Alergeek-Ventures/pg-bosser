# pg-bosser

`pg-bosser` is a tiny wrapper over [pg-boss](https://github.com/timgit/pg-boss) heavily inspired
by [BullMQ](https://github.com/taskforcesh/bullmq) providing end-to-end type safety for
queues, workers and jobs.

## Usage

### Basic example

```typescript
interface IJobPayload {
  filePath: string;
}

const unzipQueue = new Queue<IJobPayload>({
  name: "unzip-queue",
  pgBossOptions: {
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
  },
});

const worker = new Worker(unzipQueue, async (job) => {
  console.log("Processing job:", job.data.filePath);

  await new Promise((resolve) => setTimeout(resolve, 10_000));
});

const main = async () => {
  await unzipQueue.send({ filePath: "/tmp/1.zip" });

  await worker.work();
};

main();
```

The same queue using BullMQ:

```typescript
import { Queue, Worker } from "bullmq";

interface IJobPayload {
  filePath: string;
}

// Create a new connection in every instance
const unzipQueue = new Queue<IJobPayload>("unzip-queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

const myWorker = new Worker<IJobPayload>(
  "unzip-queue",
  async (job) => {
    console.log("Processing job:", job.data.filePath);

    await new Promise((resolve) => setTimeout(resolve, 10_000));
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
  },
);
```

## Development

### Install dependencies

```bash
pnpm install
```
