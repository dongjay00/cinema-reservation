import type { Reservation } from "../../domain/reservation";
import type { ReservationRepository } from "../ports/reservation-repository";

export class CancelReservationUseCase {
  private readonly repository: ReservationRepository;

  constructor(repository: ReservationRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Reservation> {
    return this.repository.cancel(id);
  }
}