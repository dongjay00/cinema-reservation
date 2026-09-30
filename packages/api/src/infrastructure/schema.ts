import {
  integer as pgInteger,
  pgTable,
  text as pgText,
} from "drizzle-orm/pg-core";
import {
  integer as sqInteger,
  sqliteTable,
  text as sqText,
} from "drizzle-orm/sqlite-core";
import type { ReservationStatus } from "../domain/reservation-status";

export const sqliteReservations = sqliteTable("reservations", {
  id: sqText("id").primaryKey(),
  showtimeId: sqText("showtime_id").notNull(),
  seatRow: sqText("seat_row").notNull(),
  seatNumber: sqInteger("seat_number").notNull(),
  customerEmail: sqText("customer_email").notNull(),
  status: sqText("status").$type<ReservationStatus>().notNull(),
});

export const postgresReservations = pgTable("reservations", {
  id: pgText("id").primaryKey(),
  showtimeId: pgText("showtime_id").notNull(),
  seatRow: pgText("seat_row").notNull(),
  seatNumber: pgInteger("seat_number").notNull(),
  customerEmail: pgText("customer_email").notNull(),
  status: pgText("status").$type<ReservationStatus>().notNull(),
});
