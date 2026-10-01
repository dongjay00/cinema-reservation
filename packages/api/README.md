# @cinema/api

Express 5 + TypeScript 백엔드. 영화 회차 목록, 좌석 상태, 예약 생성/취소/조회를 제공합니다.
영속화는 **Drizzle ORM**(기본 `better-sqlite3` 파일 `data.db`, 선택적으로 **Postgres**), 캐시는 TTL(기본 인메모리, 선택적으로 **Redis**), 예약 이벤트는 **Redis Stream**으로 발행합니다. 모든 선택은 조립 루트 `index.ts`의 환경 변수 분기입니다.

## 레이어 구조

```
packages/api/src/
├─ domain/          Movie · Showtime · Seat · Reservation (비즈니스 규칙, 외부 무지)
├─ application/
│   ├─ use-cases/   CreateReservation · CancelReservation · ListReservationsByCustomer
│   │               · ListShowtimes · GetShowtimeSeats
│   ├─ ports/       저장소·캐시·이벤트 인터페이스 (소유권: 애플리케이션)
│   └─ errors.ts    DuplicateReservation / ReservationNotFound / ShowtimeNotFound
└─ infrastructure/
    ├─ http/         Express 어댑터 + createApp
    ├─ schema.ts     Drizzle 스키마 (sqlite/pg)
    ├─ drizzle-*-reservation-repository.ts   (raw 저장소 2개는 학습용 레거시로 유지)
    ├─ in-memory-*-repository.ts             (회차·좌석 시드 데이터)
    ├─ in-memory-cache.ts / redis-cache.ts   (TTL 캐시)
    ├─ caching-showtime-seats-query.ts       (좌석 조회 데코레이터)
    ├─ invalidating-event-publisher.ts       (쓰기 직후 캐시 무효화)
    └─ notification-event-publisher.ts / redis-stream-event-publisher.ts
```

포트는 유스케이스별로 좁게 분리됩니다(ISP):

- `CreateReservationRepository` — 중복 확인 + 저장
- `CancelReservationRepository` — 조회 + 저장
- `ShowtimeSeatsQuery` — 좌석 상태 조회
- `Cache` — `get/set/delete(TTL)`
- `EventPublisher` — 도메인 이벤트 발신

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/health` | 헬스 체크 (`{ server: "ok", shared: { pong: true } }`) |
| GET | `/showtimes` | 상영 회차 목록 |
| GET | `/showtimes/:id/seats` | 회차 좌석 상태 (`SeatAvailabilityDto[]`, TTL 5초 캐시) |
| POST | `/reservations` | 예약 생성 — `201`, 중복 시 `409` |
| POST | `/reservations/:id/cancel` | 예약 취소 — `200`, 없으면 `404` |
| GET | `/reservations?customerEmail=` | 이메일로 내 예약 목록 — 형식 오류 `400` |

시드 데이터: **인셉션**·**인터스텔라** 회차, 좌석 배치 A/B/C × 1…8 (24석).

## 실행

```bash
npm run dev:api       # tsx watch, @ http://localhost:4000 — 기본 SQLite(data.db)
npm run test --workspace @cinema/api   # 77 tests (env 미지정 시 pg·redis 16개 skip)
```

환경 변수 선택(조립 루트 `index.ts`에서만):

| 변수 | 주면 | 안 주면 |
|---|---|---|
| `DATABASE_URL` | Drizzle + Postgres | Drizzle + SQLite (`data.db`) |
| `REDIS_URL` | 좌석 캐시 + 예약 이벤트 발행이 Redis로 | 인메모리 캐시 + console 알림 |

`data.db`는 SQLite 런타임 산출물이며 git에 저장되지 않습니다.