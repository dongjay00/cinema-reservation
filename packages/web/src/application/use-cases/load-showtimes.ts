import type { Showtime } from "../../domain/showtime";
import type { ShowtimeRepository } from "../ports/showtime-repository";

export class LoadShowtimesUseCase {
  private readonly repository: ShowtimeRepository;

  constructor(repository: ShowtimeRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Showtime[]> {
    return this.repository.listShowtimes();
  }
}