import type { Reservation } from "../../domain/reservation";
import type { ReservationLister } from "../ports/reservation-repository";

export class ListReservationsUseCase {
  private readonly repository: ReservationLister;

  constructor(repository: ReservationLister) {
    this.repository = repository;
  }

  async execute(email: string): Promise<Reservation[]> {
    return this.repository.listByCustomerEmail(email);
  }
}
