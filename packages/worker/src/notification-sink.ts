import type { ReservationEventDto } from "@cinema/shared";

export interface NotificationSink {
  notify(dto: ReservationEventDto): void;
}

export const consoleSink: NotificationSink = {
  notify(dto) {
    if (dto.type === "ReservationCreated") {
      console.info(
        `[알림] ${dto.customerEmail} 님, 좌석 ${dto.seatRow}-${dto.seatNumber} 예약이 확정되었습니다`,
      );
    } else {
      console.info(
        `[알림] ${dto.customerEmail} 님, 예약 ${dto.reservationId} 이(가) 취소되었습니다`,
      );
    }
  },
};
