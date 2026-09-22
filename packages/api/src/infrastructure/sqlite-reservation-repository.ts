import type { DatabaseSync } from "node:sqlite";
import type { ReservationRepository } from "../application/ports/reservation-repository";
import { Reservation } from "../domain/reservation";
import { Seat } from "../domain/seat";

const MIGRATION = `
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  showtime_id TEXT NOT NULL,
  seat_row TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL
);
`;

type ReservationRow = {
  id: string;
  showtime_id: string;
  seat_row: string;
  seat_number: number;
  customer_email: string;
  status: "CONFIRMED" | "CANCELLED";
};

export class SqliteReservationRepository implements ReservationRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
    this.db.exec(MIGRATION);
  }

  async save(reservation: Reservation): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO reservations (id, showtime_id, seat_row, seat_number, customer_email, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET status = excluded.status`,
      )
      .run(
        reservation.id,
        reservation.showtimeId,
        reservation.seat.row,
        reservation.seat.number,
        reservation.customerEmail,
        reservation.status,
      );
  }

  async findById(id: string): Promise<Reservation | undefined> {
    const row = this.db
      .prepare("SELECT * FROM reservations WHERE id = ?")
      .get(id) as ReservationRow | undefined;
    return row ? toReservation(row) : undefined;
  }

  async findActiveByShowtimeAndSeat(
    showtimeId: string,
    seat: Seat,
  ): Promise<Reservation | undefined> {
    const row = this.db
      .prepare(
        `SELECT * FROM reservations
         WHERE showtime_id = ? AND seat_row = ? AND seat_number = ? AND status = 'CONFIRMED'`,
      )
      .get(showtimeId, seat.row, seat.number) as ReservationRow | undefined;

    return row ? toReservation(row) : undefined;
  }

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM reservations
         WHERE showtime_id = ? AND status = 'CONFIRMED'`,
      )
      .all(showtimeId) as ReservationRow[];

    return rows.map((row) => new Seat(row.seat_row, row.seat_number));
  }
}

function toReservation(row: ReservationRow): Reservation {
  return new Reservation(
    row.showtime_id,
    new Seat(row.seat_row, row.seat_number),
    row.customer_email,
    row.id,
    row.status,
  );
}
