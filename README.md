# pg-boss-ts

`pg-boss-ts` is a tiny wrapper over [pg-boss](https://github.com/timgit/pg-boss) providing end-to-end type safety for
queues, workers and jobs.

## Example usage

### Basic example

```typescript
interface IJobPayload {
  filePath: string;
}

const unzipQueue = new Queue<IJobPayload>({
  name: "test-queue",
  pgBossOptions: {
    connectionString: "postgres://postgres:postgres@localhost:5433/postgres",
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

## Development

### Install dependencies

```bash
pnpm install
```
