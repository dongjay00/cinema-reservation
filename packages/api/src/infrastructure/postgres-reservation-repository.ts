import type { Pool } from "pg";
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

export { MIGRATION };

type ReservationRow = {
  id: string;
  showtime_id: string;
  seat_row: string;
  seat_number: number;
  customer_email: string;
  status: "CONFIRMED" | "CANCELLED";
};

export class PostgresReservationRepository implements ReservationRepository {
  private tablePromise?: Promise<void>;

  constructor(private readonly pool: Pool) {}

  private ensureTable(): Promise<void> {
    this.tablePromise ??= this.pool.query(MIGRATION).then(() => undefined);
    return this.tablePromise;
  }

  async save(reservation: Reservation): Promise<void> {
    await this.ensureTable();
    await this.pool.query(
      `INSERT INTO reservations (id, showtime_id, seat_row, seat_number, customer_email, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [
        reservation.id,
        reservation.showtimeId,
        reservation.seat.row,
        reservation.seat.number,
        reservation.customerEmail,
        reservation.status,
      ],
    );
  }

  async findById(id: string): Promise<Reservation | undefined> {
    const { rows } = await this.pool.query<ReservationRow>(
      "SELECT * FROM reservations WHERE id = $1",
      [id],
    );
    return rows[0] ? toReservation(rows[0]) : undefined;
  }

  async findActiveByShowtimeAndSeat(
    showtimeId: string,
    seat: Seat,
  ): Promise<Reservation | undefined> {
    const { rows } = await this.pool.query<ReservationRow>(
      `SELECT * FROM reservations
       WHERE showtime_id = $1 AND seat_row = $2 AND seat_number = $3 AND status = 'CONFIRMED'`,
      [showtimeId, seat.row, seat.number],
    );

    return rows[0] ? toReservation(rows[0]) : undefined;
  }

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    const { rows } = await this.pool.query<ReservationRow>(
      `SELECT * FROM reservations
       WHERE showtime_id = $1 AND status = 'CONFIRMED'`,
      [showtimeId],
    );

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