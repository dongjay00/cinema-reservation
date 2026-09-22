import type {
  SeatAvailability,
  ShowtimeRepository,
} from "../ports/showtime-repository";

export class LoadShowtimeSeatsUseCase {
  private readonly repository: ShowtimeRepository;

  constructor(repository: ShowtimeRepository) {
    this.repository = repository;
  }

  async execute(showtimeId: string): Promise<SeatAvailability[]> {
    return this.repository.listSeats(showtimeId);
  }
}
