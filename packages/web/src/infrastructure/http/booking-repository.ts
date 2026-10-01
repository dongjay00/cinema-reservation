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

    return toReservation(await toReservationDto(res));
  }

  async cancel(id: string): Promise<Reservation> {
    const res = await fetch(`${this.baseUrl}/reservations/${id}/cancel`, {
      method: "POST",
    });

    return toReservation(await toReservationDto(res));
  }

  async listByCustomerEmail(email: string): Promise<Reservation[]> {
    const res = await fetch(
      `${this.baseUrl}/reservations?customerEmail=${encodeURIComponent(email)}`,
    );

    if (!res.ok) {
      throw await toApiError(res);
    }
    const dtos = (await res.json()) as ReservationDto[];
    return dtos.map(toReservation);
  }
}

async function toReservationDto(res: Response): Promise<ReservationDto> {
  if (!res.ok) {
    throw await toApiError(res);
  }
  return (await res.json()) as ReservationDto;
}

async function toApiError(res: Response): Promise<Error> {
  let message = `Reservation API returned ${res.status}`;
  try {
    const body = (await res.json()) as { error?: string };
    if (body && typeof body.error === "string") {
      message = body.error;
    }
  } catch {
    // 응답 본문이 JSON이 아니면 기본 메시지를 유지한다.
  }
  if (res.status === 409) {
    return new DuplicateSeatError(message);
  }
  return new Error(message);
}

function toReservation(dto: ReservationDto): Reservation {
  return new Reservation(
    dto.id,
    dto.showtimeId,
    seatFromLabel(dto.seatLabel),
    dto.customerEmail,
    dto.status,
  );
}

function seatFromLabel(label: string): Seat {
  const dash = label.lastIndexOf("-");
  if (dash === -1) {
    throw new Error(`Invalid seat label: ${label}`);
  }
  return new Seat(label.slice(0, dash), Number(label.slice(dash + 1)));
}
