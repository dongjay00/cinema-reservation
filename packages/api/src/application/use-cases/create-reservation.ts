import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { DuplicateReservationError } from "../errors";
import { ReservationRepository } from "../ports/reservation-repository";

export interface CreateReservationInput {
  showtimeId: string;
  seat: Seat;
  customerEmail: string;
}

export class CreateReservationUseCase {
  constructor(private readonly repository: ReservationRepository) {}

  async execute(input: CreateReservationInput): Promise<Reservation> {
    const existing = await this.repository.findActiveByShowtimeAndSeat(input.showtimeId, input.seat);

    if (existing) {
      throw new DuplicateReservationError(`Seat ${input.seat.label} is already reserved for showtime ${input.showtimeId}`);
    }

    const reservation = new Reservation(input.showtimeId, input.seat, input.customerEmail);
    await this.repository.save(reservation);
    return reservation;
  }
}