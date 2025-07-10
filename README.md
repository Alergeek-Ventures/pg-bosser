# pg-boss-ts

`pg-boss-ts` is a tiny wrapper over [pg-boss](https://github.com/timgit/pg-boss) providing end-to-end type safety for
queues, workers and jobs.

## Example usage

```typescript
import { Queue } from "./queue";
import { Worker } from "./worker";
import { BossClient } from "./boss-client";
import "dotenv/config";

// queue definition
const unzipQueue = new Queue<{
  filePath: string;
}>({ name: "unzip-file" });

// worker definition
const worker = new Worker({
  queue: unzipQueue,
  callback: async (job) => {
    console.log("Processing job:", job.data);

    // sleep for 10s
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  },
});

worker.on("error", async (payload) => {
  console.error("Error", payload.jobDetails);
});

worker.on("done", async (payload) => {
  console.log("Job done:", payload.jobDetails);
});

const gracefulShutdown = async () => {
  try {
    const boss = await BossClient.getBoss();

    console.log("Stoping the boss, waiting for the jobs to be finished");

    await boss.stop();

    process.exit(0);
  } catch (err) {
    console.error("Error during cleanup", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  gracefulShutdown();
});

process.on("SIGINT", () => {
  gracefulShutdown();
});

const main = async () => {
  console.log("Sending job to queue");
  await unzipQueue.send({ filePath: "/tmp/1.zip" });

  // starting the worker
  await worker.work();
};

main();
```

## Development

### Install dependencies

```bash
pnpm install
```
