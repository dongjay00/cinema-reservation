# DDD — 도메인 모델 설계서

> Domain-Driven Design. **"도메인 전문가(영화관 직원)와 같은 언어로, 도메인 규칙이 코드에 그대로 드러나게"** 모델링한다.
> 이 문서는 SDD 명세(AC-01~12)를 객체 모델로 변환한 결과다.

- 작성일: 2026-09-18
- 대상: 도메인 계층 (`packages/api/src/domain`)

---

## 1. 유비쿼터스 언어 (Ubiquitous Language)

명세에서 정의한 용어를 그대로 **클래스/메서드/필드 이름**으로 옮긴다.
"예약하다", "취소하다" 같은 단어가 서비스가 아닌 **객체의 메서드**로 존재해야 한다.

## 2. 엔티티 vs 값 객체 (판별 근거)

| 클래스 | 종류 | 근거 |
|---|---|---|
| `Movie` | 엔티티 | 제목이 바뀌어도 식별성(id)은 유지. 수명과 정체성이 있음 |
| `Showtime` | 엔티티 | 회차마다 고유 id를 가짐 |
| `Reservation` | 엔티티(애그리거트 루트) | 자기만의 상태(CONFIRMED/CANCELLED)를 생명주기로 가짐 |
| `Seat` | **값 객체** | 같은 행·번호의 좌석은 "동일한" 좌석. 식별자 불필요. 불변 |

> 💡 **값 객체 선택의 실익**: 두 좌석이 같은지 검사할 때 `seat.equals(other)` 한 줄로 끝난다.
> 좌석에 행·번호를 조합한 `label`도 함께 제공해, 이후 저장소·화면에서 문자열 키(`A-7`)로 쓸 수 있다.

## 3. 제한 컨텍스트 (Bounded Context)

지금은 **예약 도메인** 하나만 다룬다.

```
[ 예약 컨텍스트 ]
   Movie ──> Showtime ──> Reservation
                 │            │
                 └──> Seat (값 객체, 양방향 공유)
```

- `Movie`는 예약 컨텍스트에서 "상영 인물 정보"가 아니라 **상영 시간**으로만 의미가 있다.
- 이후 스프린트에서 "정산", "알림" 컨텍스트가 생기면 여기서 분리된다. (지금은 하지 않는다 — YAGNI)

## 4. 애그리거트 분해

- **`Showtime` 애그리거트**: 루트 `Showtime`, 내부에 `Movie` 참조.
  회차에 대한 모든 수정은 `Showtime`을 통해서만.
- **`Reservation` 애그리거트**: 루트 `Reservation`, 값 객체 `Seat` 보유.
- **애그리거트 간 참조는 ID로**: `Reservation`은 `Showtime` 객체를 직접 들고 있지 않고 `showtimeId`만 가진다.
  → 다른 애그리거트를 "지나치게 얼리지" 않음

  ```
  fact: 같은 회차의 같은 좌석 중복 금지(FR-07)는
  한 애그리거트(Reservation) 내부 규칙이 아니라
  여러 예약을 검사해야 하는 규칙이다.
  → 도메인 서비스/리포지토리(다음 스프린트)에서 책임질 범위.
    도메인 객체는 "좌석 + 회차가 같으면 충돌"이라는
    **충돌 판정 로직**을 이미 제공한다.
  ```

## 5. 객체 책임 배분 (SOLID 관점)

### S — 단일 책임
- `Movie`: 제목/시간 검증과 보유.
- `Seat`: 행/번호 표현, 동등 비교.
- `Reservation`: 상태 전이 규칙만. "어떻게 저장되는지"는 모른다.

### D — 의존성 역전 (준비)
- 도메인은 어떤 인터페이스도 import하지 않는다 (순수 TS).
- 이후 `ReservationRepository` **인터페이스는 도메인/애플리케이션 계층이 소유**하고,
  `InMemoryReservationRepository` 구현이 이를 의존한다. (방향이 바깥→안쪽)

### I — 인터페이스 분리 (예고)
- 리포지토리 인터페이스는 Use Case가 실제 쓰는 메서드만 노출한다.
  예: `findByShowtimeAndSeat()`, `save()` — 오늘의 데모에서는 아직 안 만든다.

## 6. 내부 구조 다이어그램

```
packages/api/src/domain/
├── movie.ts            → class Movie            (엔티티)
├── showtime.ts         → class Showtime         (애그리거트 루트)
├── seat.ts             → class Seat             (값 객체)
├── reservation-status.ts → ReservationStatus 타입 (리터럴 유니언)
└── reservation.ts      → class Reservation      (애그리거트 루트)
```

## 7. 설계 결정 기록 (ADR)

| 결정 | 이유 | 대안 |
|---|---|---|
| id를 `crypto.randomUUID()`로 생성 | 애플리케이션 어디서도 중복 없이 생성 | DB 자동증가 id (DB 의존 → 배제) |
| `Reservation.status`를 `private` + getter | 상태 변경 경로를 메서드로 강제 = **컴파일 단계에서 상태 직접 대입을 차단** | public 필드 (규칙 위반 가능) |
| `Seat`를 값 객체로 | 동등성·라벨, 재사용 | `{ row, number }` 원시 객체 (규칙 중복) |
| 전이 조건을 도메인에서 검증 | "무엇이 유효한가"를 도메인이 아는 것 | 컨트롤러에서 검증 (규칙 분산) |

## 8. 다음 스프린트 연결점

- `ReservationRepository` 인터페이스 + 인메모리 구현 → FR-07(중복 예약 금지) 실현
- `CreateReservation`, `CancelReservation` Use Case → 상태 전이의 진입점이 된다