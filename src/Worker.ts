import { EventEmitter } from "events";
import type PgBoss from "pg-boss";
import type { Queue } from "./Queue";

export type IWorkerEvent<IPayload> = {
  error: {
    job: PgBoss.Job<IPayload>;
    error: Error;
  };
  done: {
    job: PgBoss.Job<IPayload>;
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

    await boss.work<IPayload>(this.queue.queueName, async (jobs) => {
      for (const job of jobs) {
        try {
          // execute the actual worker task
          await this.callback(job);

          this.emitEvent("done", { job });
        } catch (error) {
          this.emitEvent("error", {
            error: error as Error,
            job,
          });
        }
      }
    });
  }

  private emitEvent<EventName extends keyof IWorkerEvent<IPayload>>(
    eventName: EventName,
    payload: IWorkerEvent<IPayload>[EventName],
  ) {
    this.eventBus.emit(eventName as string, payload);
  }

  public on<EventName extends keyof IWorkerEvent<IPayload>>(
    eventName: EventName,
    callback: (
      payload: IWorkerEvent<IPayload>[EventName],
    ) => Promise<void> | void,
  ) {
    this.eventBus.on(eventName, callback);
  }
}
