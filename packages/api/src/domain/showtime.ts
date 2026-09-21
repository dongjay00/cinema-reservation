import { randomUUID } from "node:crypto";
import { Movie } from "./movie";

export class Showtime {
  readonly id: string;
  readonly movie: Movie;
  readonly startsAt: Date;

  constructor(movie: Movie, startsAt: Date, id: string = randomUUID()) {
    if (!(startsAt instanceof Date) || Number.isNaN(startsAt.getTime())) {
      throw new Error("Showtime startsAt must be a valid Date");
    }

    this.id = id;
    this.movie = movie;
    this.startsAt = startsAt;
  }
}