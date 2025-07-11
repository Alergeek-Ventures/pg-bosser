import type PgBoss from "pg-boss";

export { Queue } from "./Queue";
export { Worker, type IWorkerEvent } from "./Worker";

export type Job<T> = PgBoss.Job<T>;
