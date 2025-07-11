import { EventEmitter } from "events";
import type PgBoss from "pg-boss";
import type { Queue } from "./Queue";

export type IWorkerEvent = {
  error: {
    jobDetails: Omit<PgBoss.Job, "data">;
    error: Error;
  };
  done: {
    jobDetails: Omit<PgBoss.Job, "data">;
  };
};

export class Worker<IPayload extends object> {
  private readonly callback: (job: PgBoss.Job<IPayload>) => Promise<void>;

  private readonly queue: Queue<IPayload>;

  private eventBus: EventEmitter = new EventEmitter();

  constructor(
    queue: Queue<IPayload>,
    callback: (job: { data: IPayload }) => Promise<void>,
  ) {
    this.callback = callback;
    this.queue = queue;
  }

  public async work(): Promise<void> {
    const boss = await this.queue.getBoss();

    await boss.work<IPayload>(this.queue.queueName, async ([job]) => {
      const { data, ...rest } = job;

      try {
        // execute the actual worker task
        await this.callback(job);

        this.emitEvent("done", { jobDetails: rest });
      } catch (error) {
        const { data, ...rest } = job;

        this.emitEvent("error", {
          error: error as Error,
          jobDetails: rest,
        });
      }
    });
  }

  private emitEvent<EventName extends keyof IWorkerEvent>(
    eventName: EventName,
    payload: IWorkerEvent[EventName],
  ) {
    this.eventBus.emit(eventName as string, payload);
  }

  public on<EventName extends keyof IWorkerEvent>(
    eventName: EventName,
    callback: (payload: IWorkerEvent[EventName]) => Promise<void>,
  ) {
    this.eventBus.on(eventName, callback);
  }
}
