import type { Database } from "better-sqlite3";
import { eq, sql } from "drizzle-orm";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import { DuplicateReservationError } from "../application/errors";
import type { ReservationRepository } from "../application/ports/reservation-repository";
import { Reservation } from "../domain/reservation";
import { Seat } from "../domain/seat";
import { sqliteReservations } from "./schema";

const MIGRATION = `
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  showtime_id TEXT NOT NULL,
  seat_row TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reservations_active_seat
  ON reservations(showtime_id, seat_row, seat_number)
  WHERE status = 'CONFIRMED';
`;

type ReservationRow = {
  id: string;
  showtimeId: string;
  seatRow: string;
  seatNumber: number;
  customerEmail: string;
  status: "CONFIRMED" | "CANCELLED";
};

export class DrizzleSqliteReservationRepository
  implements ReservationRepository
{
  private readonly db: BetterSQLite3Database;

  constructor(client: Database) {
    client.exec(MIGRATION);
    this.db = drizzle(client);
  }

  async save(reservation: Reservation): Promise<void> {
    try {
      await this.db
        .insert(sqliteReservations)
        .values(toRow(reservation))
        .onConflictDoUpdate({
          target: sqliteReservations.id,
          set: { status: sql`excluded.status` },
        });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DuplicateReservationError(
          `Seat ${reservation.seat.label} is already reserved for showtime ${reservation.showtimeId}`,
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Reservation | undefined> {
    const rows = await this.db
      .select()
      .from(sqliteReservations)
      .where(eq(sqliteReservations.id, id));
    return rows[0] ? toReservation(rows[0]) : undefined;
  }

  async findActiveByShowtimeAndSeat(
    showtimeId: string,
    seat: Seat,
  ): Promise<Reservation | undefined> {
    const rows = await this.db
      .select()
      .from(sqliteReservations)
      .where(
        eq(sqliteReservations.showtimeId, showtimeId) &&
          eq(sqliteReservations.seatRow, seat.row) &&
          eq(sqliteReservations.seatNumber, seat.number) &&
          eq(sqliteReservations.status, "CONFIRMED"),
      );
    return rows[0] ? toReservation(rows[0]) : undefined;
  }

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    const rows = await this.db
      .select()
      .from(sqliteReservations)
      .where(
        eq(sqliteReservations.showtimeId, showtimeId) &&
          eq(sqliteReservations.status, "CONFIRMED"),
      );
    return rows.map((row) => new Seat(row.seatRow, row.seatNumber));
  }

  async findByCustomerEmail(email: string): Promise<Reservation[]> {
    const rows = await this.db
      .select()
      .from(sqliteReservations)
      .where(eq(sqliteReservations.customerEmail, email));
    return rows.map(toReservation);
  }
}

function toRow(reservation: Reservation): ReservationRow {
  return {
    id: reservation.id,
    showtimeId: reservation.showtimeId,
    seatRow: reservation.seat.row,
    seatNumber: reservation.seat.number,
    customerEmail: reservation.customerEmail,
    status: reservation.status,
  };
}

function toReservation(row: ReservationRow): Reservation {
  return new Reservation(
    row.showtimeId,
    new Seat(row.seatRow, row.seatNumber),
    row.customerEmail,
    row.id,
    row.status,
  );
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string })?.code === "SQLITE_CONSTRAINT_UNIQUE";
}
