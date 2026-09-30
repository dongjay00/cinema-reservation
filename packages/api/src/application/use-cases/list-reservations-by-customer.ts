import type { Reservation } from "../../domain/reservation";
import type { ReservationsByCustomerQuery } from "../ports/reservation-repository";

export class ListReservationsByCustomerUseCase {
  constructor(private readonly repository: ReservationsByCustomerQuery) {}

  async execute(email: string): Promise<Reservation[]> {
    return this.repository.findByCustomerEmail(email);
  }
}
