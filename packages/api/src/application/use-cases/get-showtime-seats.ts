import { Seat } from "../../domain/seat";
import { ShowtimeNotFoundError } from "../errors";
import type { ReservationRepository } from "../ports/reservation-repository";
import type { ShowtimeRepository } from "../ports/showtime-repository";

export type SeatAvailability = {
  seat: Seat;
  available: boolean;
};

export class GetShowtimeSeatsUseCase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly showtimeRepository: ShowtimeRepository,
  ) {}

  async execute(showtimeId: string): Promise<SeatAvailability[]> {
    const showtime = await this.showtimeRepository.findById(showtimeId);
    if (!showtime) {
      throw new ShowtimeNotFoundError(`Showtime ${showtimeId} not found`);
    }

    const occupied = await this.reservationRepository.findActiveSeatsByShowtime(showtimeId);
    const seats = await this.showtimeRepository.listSeats();

    return seats.map((seat) => ({
      seat,
      available: !occupied.some((occupiedSeat) => occupiedSeat.equals(seat)),
    }));
  }
}