import { Reservation } from "../../domain/reservation";
import { ReservationNotFoundError } from "../errors";
import { ReservationRepository } from "../ports/reservation-repository";

export class CancelReservationUseCase {
  constructor(private readonly repository: ReservationRepository) {}

  async execute(reservationId: string): Promise<Reservation> {
    const reservation = await this.repository.findById(reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(`Reservation ${reservationId} not found`);
    }

    reservation.cancel();
    await this.repository.save(reservation);
    return reservation;
  }
}