export interface PingResult {
  pong: boolean;
}

export function ping(): PingResult {
  return { pong: true };
}

export type ReservationStatusDto = "CONFIRMED" | "CANCELLED";

export interface CreateReservationRequest {
  showtimeId: string;
  row: string;
  number: number;
  customerEmail: string;
}

export interface ReservationDto {
  id: string;
  showtimeId: string;
  seatLabel: string;
  customerEmail: string;
  status: ReservationStatusDto;
}

export interface ShowtimeDto {
  id: string;
  movieTitle: string;
  startsAt: string;
}

export interface SeatAvailabilityDto {
  seatLabel: string;
  available: boolean;
}

export type ReservationEventDto =
  | {
      type: "ReservationCreated";
      reservationId: string;
      showtimeId: string;
      seatRow: string;
      seatNumber: number;
      customerEmail: string;
    }
  | {
      type: "ReservationCancelled";
      reservationId: string;
      showtimeId: string;
      customerEmail: string;
    };

export const RESERVATION_EVENT_STREAM = "stream:reservations";
