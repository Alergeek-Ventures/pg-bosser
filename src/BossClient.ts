import PgBoss from "pg-boss";

export class BossClient {
  private static instance: BossClient | null;
  private pgBoss!: PgBoss;

  // private constructor to prevent initialization from outside
  private constructor() {}

  private async initialize() {
    this.pgBoss = new PgBoss({
      connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`,
      schema: "pgboss",
    });

    await this.pgBoss.start();
  }

  public static async getBoss(): Promise<PgBoss> {
    if (!BossClient.instance) {
      BossClient.instance = new BossClient();
      await BossClient.instance.initialize();
    }

    return BossClient.instance.pgBoss;
  }
}
