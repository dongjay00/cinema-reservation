import { Reservation } from "../domain/reservation";
import { Seat } from "../domain/seat";
import { ReservationRepository } from "../application/ports/reservation-repository";

export class InMemoryReservationRepository implements ReservationRepository {
  private readonly reservations: Array<Reservation> = [];

  async save(reservation: Reservation): Promise<void> {
    const index = this.reservations.findIndex((r) => r.id === reservation.id);
    if (index >= 0) {
      this.reservations[index] = reservation;
    } else {
      this.reservations.push(reservation);
    }
  }

  async findById(id: string): Promise<Reservation | undefined> {
    return this.reservations.find((r) => r.id === id);
  }

  async findActiveByShowtimeAndSeat(showtimeId: string, seat: Seat): Promise<Reservation | undefined> {
    return this.reservations.find(
      (r) => r.showtimeId === showtimeId && r.seat.equals(seat) && r.status === "CONFIRMED",
    );
  }
}