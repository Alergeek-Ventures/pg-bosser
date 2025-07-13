import PgBoss from "pg-boss";

export type IQueueOptions = Omit<PgBoss.Queue, "name">;

export class Queue<IPayload extends object> {
  public readonly queueName: string;
  private readonly queueOptions: PgBoss.Queue & { deadLetter: string };

  private readonly pgBossOptions: PgBoss.ConstructorOptions;
  readonly boss: PgBoss;

  constructor({
    name,
    options,
    pgBossOptions,
  }: {
    name: string;
    options?: IQueueOptions;
    pgBossOptions: PgBoss.ConstructorOptions;
  }) {
    this.queueName = name;

    if (!options) {
      options = {};
    }

    if (!options.deadLetter) {
      options.deadLetter = `${name}-dlq`;
    }

    this.queueOptions = {
      ...options,
      deadLetter: options.deadLetter,
      name: this.queueName,
    };

    this.pgBossOptions = pgBossOptions;
    this.boss = new PgBoss(this.pgBossOptions);
  }

  public async getBoss(): Promise<PgBoss> {
    await this.boss.start();

    // create dead letter queue if it does not exist
    const dlq = await this.boss.getQueue(this.queueOptions.deadLetter);
    if (!dlq) {
      await this.boss.createQueue(this.queueOptions.deadLetter);
    }

    // create queue if it does not exist
    const queue = await this.boss.getQueue(this.queueName);
    if (!queue) {
      await this.boss.createQueue(this.queueName, this.queueOptions);
    }

    return this.boss;
  }

  public async send(payload: IPayload): Promise<void> {
    const boss = await this.getBoss();

    await boss.send({
      name: this.queueName,
      data: payload,
      options: this.queueOptions,
    });
  }

  public async sendDebounced(
    payload: IPayload,
    debounceSeconds: number,
  ): Promise<void> {
    const boss = await this.getBoss();

    await boss.sendDebounced(
      this.queueName,
      payload,
      this.queueOptions || {},
      debounceSeconds,
    );
  }

  public async schedule(cron: string, payload: IPayload): Promise<void> {
    const boss = await this.getBoss();

    await boss.schedule(this.queueName, cron, payload, this.queueOptions);
  }
}
