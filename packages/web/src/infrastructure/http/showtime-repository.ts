import type { SeatAvailabilityDto, ShowtimeDto } from "@cinema/shared";
import { Showtime } from "../../domain/showtime";
import { Seat } from "../../domain/seat";
import type { SeatAvailability, ShowtimeRepository } from "../../application/ports/showtime-repository";

export class HttpShowtimeRepository implements ShowtimeRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async listShowtimes(): Promise<Showtime[]> {
    const res = await fetch(`${this.baseUrl}/showtimes`);
    if (!res.ok) {
      throw new Error(`Showtime API returned ${res.status}`);
    }
    const dtos = (await res.json()) as ShowtimeDto[];
    return dtos.map(toShowtime);
  }

  async listSeats(showtimeId: string): Promise<SeatAvailability[]> {
    const res = await fetch(`${this.baseUrl}/showtimes/${showtimeId}/seats`);
    if (!res.ok) {
      throw new Error(`Seat API returned ${res.status}`);
    }
    const dtos = (await res.json()) as SeatAvailabilityDto[];
    return dtos.map(toSeatAvailability);
  }
}

function toShowtime(dto: ShowtimeDto): Showtime {
  return new Showtime(dto.id, dto.movieTitle, new Date(dto.startsAt));
}

function toSeatAvailability(dto: SeatAvailabilityDto): SeatAvailability {
  const [row, number] = dto.seatLabel.split("-");
  return { seat: new Seat(row, Number(number)), available: dto.available };
}