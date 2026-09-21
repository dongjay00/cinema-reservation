import { describe, expect, it } from "vitest";
import { BookingDraft } from "../../domain/booking-draft";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { DuplicateSeatError } from "../errors";
import type { CreateReservationParams, ReservationRepository } from "../ports/reservation-repository";
import { ReserveSeatUseCase } from "../use-cases/reserve-seat";

class FakeReservationRepository implements ReservationRepository {
  private readonly failWithDuplicate: boolean;

  constructor(failWithDuplicate: boolean) {
    this.failWithDuplicate = failWithDuplicate;
  }

  async create(params: CreateReservationParams): Promise<Reservation> {
    if (this.failWithDuplicate) {
      throw new DuplicateSeatError("이미 예약된 좌석입니다");
    }
    return new Reservation("res-1", params.showtimeId, params.seat, params.customerEmail, "CONFIRMED");
  }

  async cancel(_id: string): Promise<Reservation> {
    throw new Error("이 테스트에서 미사용");
  }
}

describe("ReserveSeatUseCase (FE 애플리케이션)", () => {
  const readyDraft = () => {
    const draft = new BookingDraft("showtime-1");
    draft.selectSeat(new Seat("A", 7));
    draft.setCustomerEmail("hoon@example.com");
    return draft;
  };

  it("완성된 예약 초안을 저장소로 보내 예약을 반환한다", async () => {
    const useCase = new ReserveSeatUseCase(new FakeReservationRepository(false));

    const reservation = await useCase.execute(readyDraft());

    expect(reservation.id).toBe("res-1");
    expect(reservation.status).toBe("CONFIRMED");
  });

  it("좌석이 이미 사용 중이면 DuplicateSeatError를 그대로 올린다", async () => {
    const useCase = new ReserveSeatUseCase(new FakeReservationRepository(true));

    await expect(useCase.execute(readyDraft())).rejects.toBeInstanceOf(DuplicateSeatError);
  });

  it("초안이 미완성(이메일 없음)이면 실패한다", async () => {
    const useCase = new ReserveSeatUseCase(new FakeReservationRepository(false));

    const incomplete = new BookingDraft("showtime-1");
    incomplete.selectSeat(new Seat("A", 7));

    await expect(useCase.execute(incomplete)).rejects.toThrow();
  });
});