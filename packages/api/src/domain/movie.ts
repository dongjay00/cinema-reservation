import { randomUUID } from "node:crypto";

export class Movie {
  readonly id: string;
  readonly title: string;
  readonly durationMinutes: number;

  constructor(
    title: string,
    durationMinutes: number,
    id: string = randomUUID(),
  ) {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new Error("Movie title must not be empty");
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      throw new Error("Movie durationMinutes must be a positive integer");
    }

    this.id = id;
    this.title = trimmed;
    this.durationMinutes = durationMinutes;
  }
}
