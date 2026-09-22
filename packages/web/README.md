# @cinema/web

React 19 + Vite 프론트엔드. 백엔드와 **동일한 4-레이어 구조를 미러**해서, 클라이언트 단독으로도 클린 아키텍처가 유지됩니다.

## 레이어 구조

```
packages/web/src/
├─ domain/          Seat · Showtime · BookingDraft · Reservation (화면의 규칙)
├─ application/
│   ├─ use-cases/   ReserveSeat · CancelReservation · LoadShowtimes · LoadShowtimeSeats
│   ├─ ports/       ReservationCreator · ReservationCanceller · ShowtimeRepository
│   └─ errors.ts
└─ infrastructure/
    ├─ http/        HTTP 어댑터 (shared DTO 계약 구현)
    └─ components/  SeatPicker · ShowtimeSelector · BookingForm (순수 React)
```

`App.tsx`가 **컴포지션 루트** — 유스케이스에 `HttpReservationRepository`/`HttpShowtimeRepository`를 주입해 화면을 조립합니다.

## 화면 동작

1. 회차 선택 → 좌석 상태 로드
2. 좌석 선택 + 이메일 입력 → 예약 (중복 좌석이면 에러)
3. 예약 내역에서 취소 → 좌석이 다시 활성화

상태 경계 규칙: **"회차 미선택"은 도메인 객체를 만들지 않는 것**(`undefined`)으로 표현합니다. 도메인이 금지하는 불법 상태를 UI가 만들지 않는 구조입니다.

## 실행

```bash
npm run dev --workspace @cinema/web       # Vite @ http://localhost:5173
npm run test --workspace @cinema/web      # 15 tests
```

API는 기본적으로 `http://localhost:4000`를 호출합니다 (`App.tsx`의 `BASE_URL`).

## 참고

- 웹 tsconfig는 `erasableSyntaxOnly`·`verbatimModuleSyntax`를 켜서 **생성자 파라미터 프로퍼티**와 **타입 import**에 대한 제약이 더 엄격합니다 — 백엔드의 "갈 수 있는 코드"와 프론트의 "갈 수 있는 코드"가 다르다는 점을 체감할 수 있습니다.
- 린트/포맷은 루트의 biome 설정을 사용합니다 (`npm run lint`).