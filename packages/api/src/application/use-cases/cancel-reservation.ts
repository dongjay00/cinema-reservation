import type { Reservation } from "../../domain/reservation";
import { ReservationNotFoundError } from "../errors";
import type { EventPublisher } from "../ports/event-publisher";
import type { CancelReservationRepository } from "../ports/reservation-repository";

export class CancelReservationUseCase {
  constructor(
    private readonly repository: CancelReservationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(reservationId: string): Promise<Reservation> {
    const reservation = await this.repository.findById(reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(
        `Reservation ${reservationId} not found`,
      );
    }

    reservation.cancel();
    await this.repository.save(reservation);
    await this.publisher.publish(reservation.takeRecordedEvents());
    return reservation;
  }
}
