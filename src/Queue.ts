import type PgBoss from "pg-boss";
import { BossClient } from "./BossClient";

export class Queue<IPayload extends object> {
  public readonly name: string;
  private readonly options: PgBoss.Queue | undefined;

  private deadLetterQueue: Queue<IPayload> | null = null;
  private readonly deadLetterQueueName: string;
  private readonly isDeadLetter: boolean = false;

  constructor({
    name,
    options,
    isDeadLetter,
  }: {
    name: string;
    options?: PgBoss.Queue;
    isDeadLetter?: boolean;
  }) {
    this.name = name;

    let deadLetterQueueName = `${name}-dlq`;
    if (options && options.deadLetter) {
      deadLetterQueueName = options.deadLetter;
    }

    if (isDeadLetter) {
      this.isDeadLetter = true;
    }

    this.deadLetterQueueName = deadLetterQueueName;

    this.options = options;
  }

  public async getBoss(): Promise<PgBoss> {
    const boss = await BossClient.getBoss();

    const queue = await boss.getQueue(this.name);
    if (!queue) {
      await boss.createQueue(this.name, this.options);
    }

    // prevents recurrent creation of dead letter queues
    if (!this.deadLetterQueue && !this.isDeadLetter) {
      this.deadLetterQueue = new Queue<IPayload>({
        name: this.deadLetterQueueName,
        isDeadLetter: true,
      });

      // initialize the dead letter queue
      await this.deadLetterQueue.getBoss();
    }

    return boss;
  }

  public async send(payload: IPayload): Promise<void> {
    const boss = await this.getBoss();

    await boss.send({
      name: this.name,
      data: payload,
      options: this.options,
    });
  }

  public async sendDebounced(
    payload: IPayload,
    debounceSeconds: number,
  ): Promise<void> {
    const boss = await this.getBoss();

    await boss.sendDebounced(
      this.name,
      payload,
      this.options || {},
      debounceSeconds,
    );
  }

  public async schedule(payload: IPayload, cron: string): Promise<void> {
    const boss = await this.getBoss();

    await boss.schedule(this.name, cron, payload, this.options);
  }
}
