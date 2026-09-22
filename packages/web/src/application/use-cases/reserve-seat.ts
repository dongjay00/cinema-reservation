import type { BookingDraft } from "../../domain/booking-draft";
import type { Reservation } from "../../domain/reservation";
import type { ReservationCreator } from "../ports/reservation-repository";

export class ReserveSeatUseCase {
  private readonly repository: ReservationCreator;

  constructor(repository: ReservationCreator) {
    this.repository = repository;
  }

  async execute(draft: BookingDraft): Promise<Reservation> {
    if (draft.seat === undefined || !draft.isValid) {
      throw new Error("예약 정보가 완성되지 않았습니다");
    }

    return this.repository.create({
      showtimeId: draft.showtimeId,
      seat: draft.seat,
      customerEmail: draft.customerEmail,
    });
  }
}