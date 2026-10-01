# @cinema/shared

**api ↔ web**의 HTTP DTO 계약과 **api ↔ worker**의 이벤트 계약을 함께 정의하는 패키지입니다.
네트워크 경계를 넘는 타입은 여기 한 곳에서 정의하고, 각 패키지는 이 계약을 구현하는 어댑터만 가집니다.

```ts
export interface PingResult            // GET /health 응답
export type ReservationStatusDto = "CONFIRMED" | "CANCELLED"

export interface CreateReservationRequest  // POST /reservations 본문
export interface ReservationDto            // 예약 응답
export interface ShowtimeDto               // 회차 응답
export interface SeatAvailabilityDto       // 좌석 상태 응답

export type ReservationEventDto            // 예약 이벤트 (Redis Stream 페이로드)
export const RESERVATION_EVENT_STREAM      // "stream:reservations"
```

`ReservationEventDto`는 판별 유니온(`ReservationCreated`/`ReservationCancelled`)입니다. api가 `XADD`로 발행하고, `@cinema/worker`가 `XREADGROUP`으로 소비해 역직렬화하므로 **작성자/구독자가 같은 타입으로 직렬화·역직렬화**됩니다.

## 규칙

- 도메인의 값 객체(`Seat`)가 아닌 **전송용 형태**만 정의합니다 — `SeatAvailabilityDto.seatLabel`처럼 계층이 바뀌면서 퇴화된 형태.
- 두 워크스페이스의 도메인이 `shared`를 직접 쓸 수는 있지만, 현재는 **HTTP 어댑터 / 워커 파서가 DTO → 도메인 변환**을 담당합니다.

## 사용

```bash
npm run typecheck --workspace @cinema/shared
```