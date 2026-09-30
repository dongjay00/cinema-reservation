import type { CreateReservationRequest, ReservationDto } from "@cinema/shared";
import { DuplicateSeatError } from "../../application/errors";
import type {
  CreateReservationParams,
  ReservationRepository,
} from "../../application/ports/reservation-repository";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";

export class HttpReservationRepository implements ReservationRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async create(params: CreateReservationParams): Promise<Reservation> {
    const request: CreateReservationRequest = {
      showtimeId: params.showtimeId,
      row: params.seat.row,
      number: params.seat.number,
      customerEmail: params.customerEmail,
    };

    const res = await fetch(`${this.baseUrl}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    return toReservation(await toDto(res));
  }

  async cancel(id: string): Promise<Reservation> {
    const res = await fetch(`${this.baseUrl}/reservations/${id}/cancel`, {
      method: "POST",
    });

    return toReservation(await toDto(res));
  }

  async listByCustomerEmail(email: string): Promise<Reservation[]> {
    const res = await fetch(
      `${this.baseUrl}/reservations?customerEmail=${encodeURIComponent(email)}`,
    );

    if (!res.ok) {
      throw new Error(`Reservation API returned ${res.status}`);
    }
    const dtos = (await res.json()) as ReservationDto[];
    return dtos.map(toReservation);
  }
}

async function toDto(res: Response): Promise<ReservationDto> {
  if (res.status === 409) {
    throw new DuplicateSeatError("이미 예약된 좌석입니다");
  }
  if (!res.ok) {
    throw new Error(`Reservation API returned ${res.status}`);
  }
  return (await res.json()) as ReservationDto;
}

function toReservation(dto: ReservationDto): Reservation {
  const [row, number] = dto.seatLabel.split("-");
  return new Reservation(
    dto.id,
    dto.showtimeId,
    new Seat(row, Number(number)),
    dto.customerEmail,
    dto.status,
  );
}
