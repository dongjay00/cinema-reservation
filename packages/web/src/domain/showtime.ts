export class Showtime {
  readonly id: string;
  readonly movieTitle: string;
  readonly startsAt: Date;

  constructor(id: string, movieTitle: string, startsAt: Date) {
    if (id.trim().length === 0) {
      throw new Error("Showtime id must not be empty");
    }
    if (movieTitle.trim().length === 0) {
      throw new Error("Showtime movieTitle must not be empty");
    }
    this.id = id;
    this.movieTitle = movieTitle;
    this.startsAt = startsAt;
  }
}
