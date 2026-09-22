import type { Showtime } from "../../domain/showtime";
import type { ShowtimeRepository } from "../ports/showtime-repository";

export class ListShowtimesUseCase {
  constructor(private readonly repository: ShowtimeRepository) {}

  async execute(): Promise<Showtime[]> {
    return this.repository.findAll();
  }
}
