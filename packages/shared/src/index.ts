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