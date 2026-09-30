import { eq, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { DuplicateReservationError } from "../application/errors";
import type { ReservationRepository } from "../application/ports/reservation-repository";
import { Reservation } from "../domain/reservation";
import { Seat } from "../domain/seat";
import { postgresReservations } from "./schema";

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

export { MIGRATION };

type ReservationRow = {
  id: string;
  showtimeId: string;
  seatRow: string;
  seatNumber: number;
  customerEmail: string;
  status: "CONFIRMED" | "CANCELLED";
};

export class DrizzlePostgresReservationRepository
  implements ReservationRepository
{
  private tablePromise?: Promise<void>;
  private readonly db: NodePgDatabase;

  constructor(private readonly pool: Pool) {
    this.db = drizzle(pool);
  }

  private ensureTable(): Promise<void> {
    this.tablePromise ??= this.pool.query(MIGRATION).then(() => {});
    return this.tablePromise;
  }

  async save(reservation: Reservation): Promise<void> {
    await this.ensureTable();
    try {
      await this.db
        .insert(postgresReservations)
        .values(toRow(reservation))
        .onConflictDoUpdate({
          target: postgresReservations.id,
          set: { status: sql`EXCLUDED.status` },
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
    await this.ensureTable();
    const rows = await this.db
      .select()
      .from(postgresReservations)
      .where(eq(postgresReservations.id, id));
    return rows[0] ? toReservation(rows[0]) : undefined;
  }

  async findActiveByShowtimeAndSeat(
    showtimeId: string,
    seat: Seat,
  ): Promise<Reservation | undefined> {
    await this.ensureTable();
    const rows = await this.db
      .select()
      .from(postgresReservations)
      .where(
        eq(postgresReservations.showtimeId, showtimeId) &&
          eq(postgresReservations.seatRow, seat.row) &&
          eq(postgresReservations.seatNumber, seat.number) &&
          eq(postgresReservations.status, "CONFIRMED"),
      );
    return rows[0] ? toReservation(rows[0]) : undefined;
  }

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    await this.ensureTable();
    const rows = await this.db
      .select()
      .from(postgresReservations)
      .where(
        eq(postgresReservations.showtimeId, showtimeId) &&
          eq(postgresReservations.status, "CONFIRMED"),
      );
    return rows.map((row) => new Seat(row.seatRow, row.seatNumber));
  }

  async findByCustomerEmail(email: string): Promise<Reservation[]> {
    await this.ensureTable();
    const rows = await this.db
      .select()
      .from(postgresReservations)
      .where(eq(postgresReservations.customerEmail, email));
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
  let current: unknown = error;
  while (current) {
    if ((current as { code?: string })?.code === "23505") return true;
    current = (current as { cause?: unknown })?.cause;
  }
  return false;
}
