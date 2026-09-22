import type { Reservation } from "../../domain/reservation";
import type { ReservationCanceller } from "../ports/reservation-repository";

export class CancelReservationUseCase {
  private readonly repository: ReservationCanceller;

  constructor(repository: ReservationCanceller) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Reservation> {
    return this.repository.cancel(id);
  }
}