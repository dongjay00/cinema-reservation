# @cinema/api

Express 5 + TypeScript 백엔드. 영화 회차 목록, 좌석 상태, 예약 생성/취소를 제공합니다. 영속화는 Node 내장 `node:sqlite`(파일 `data.db`)를 사용해 외부 DB 의존성이 없습니다.

## 레이어 구조

```
packages/api/src/
├─ domain/          Movie · Showtime · Seat · Reservation (비즈니스 규칙, 외부 무지)
├─ application/
│   ├─ use-cases/   CreateReservation · CancelReservation · ListShowtimes · GetShowtimeSeats
│   ├─ ports/       저장소 인터페이스 (소유권: 애플리케이션)
│   └─ errors.ts    DuplicateReservation / ReservationNotFound / ShowtimeNotFound
└─ infrastructure/
    ├─ http/         Express 어댑터 + createApp(조립 지점)
    ├─ sqlite-reservation-repository.ts
    ├─ in-memory-reservation-repository.ts
    └─ in-memory-showtime-repository.ts   (회차·좌석 시드 데이터)
```

포트는 유스케이스별로 좁게 분리됩니다(ISP):

- `CreateReservationRepository` — 중복 확인 + 저장
- `CancelReservationRepository` — 조회 + 저장
- `ShowtimeSeatsQuery` — 좌석 상태 조회

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/health` | 헬스 체크 (`{ pong: true }`) |
| GET | `/showtimes` | 상영 회차 목록 |
| GET | `/showtimes/:id/seats` | 회차 좌석 상태 (`SeatAvailabilityDto[]`) |
| POST | `/reservations` | 예약 생성 — `201`, 중복 시 `409` |
| POST | `/reservations/:id/cancel` | 예약 취소 — `200`, 없으면 `404` |

시드 데이터: **인셉션**·**인터스텔라** 회차, 좌석 배치 A/B/C × 1…8 (24석).

## 실행

```bash
npm run dev:api       # tsx watch, @ http://localhost:4000
npm run test --workspace @cinema/api   # 33 tests
```

`data.db`는 실행 중 생성되는 런타임 산출물이며 git에 저장되지 않습니다.