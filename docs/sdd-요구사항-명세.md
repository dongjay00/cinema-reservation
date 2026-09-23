# SDD — 요구사항 명세서

> Specification-Driven Development. **"무엇을 만들 것인가"**를 코드보다 먼저, 인수 기준(Acceptance Criteria) 단위로 고정한다.
> 이 문서의 "인수 기준"은 이후 TDD 테스트의 출처가 된다. AC-XX 번호가 곧 테스트 이름과 연결된다.

- 작성일: 2026-09-18
- 대상: 온라인 영화관 좌석 예약 시스템 (프로젝트: cinema-reservation)
- 범위 (이 스프린트): **도메인(Entities) 계층** — 저장·HTTP·UI는 이후 스프린트

---

## 1. 개요

사용자가 영화와 상영회차를 고르고, 좌석을 선택해 예약하고, 예약을 취소할 수 있는 시스템.
본 명세의 초점은 "좌석 중복 예약을 허용하지 않는다"는 **핵심 불변식**이며, 이를 도메인 규칙으로 표현하는 것이 목표다.

## 2. 용어 (유비쿼터스 언어)

| 용어 | 의미 |
|---|---|
| 영화 (Movie) | 상영되는 작품. 제목과 상영 시간을 가진다. |
| 상영회차 (Showtime) | 특정 영화가 특정 시각에 상영되는 일정. |
| 좌석 (Seat) | 행(row)과 번호(number)로 표현되는 물리적 좌석. 같은 영화관이면 동일 좌석은 하나뿐. |
| 예약 (Reservation) | 특정 회차 + 특정 좌석에 대한 예약자(이메일)의 확약. |
| 확정 (CONFIRMED) | 예약이 유효한 상태. |
| 취소 (CANCELLED) | 예약이 무효가 된 상태. |

## 3. 사용자 스토리

```gherkin
Feature: 영화 좌석 예약
  Scenario: 예약 생성
    Given 상영회차와 좌석, 예약자 이메일이 주어졌을 때
    When 예약을 생성하면
    Then 예약 상태는 CONFIRMED 이다

  Scenario: 예약 취소
    Given CONFIRMED 상태의 예약이 있을 때
    When 취소하면
    Then 상태가 CANCELLED 로 바뀐다

  Scenario: 중복 취소 금지
    Given CANCELLED 상태의 예약이 있을 때
    When 다시 취소를 시도하면
    Then 예외가 발생한다
```

## 4. 기능 요구사항

| ID | 우선순위 | 요구사항 |
|---|---|---|
| FR-01 | MUST | 영화는 제목과 상영 시간(분)을 가진다. |
| FR-02 | MUST | 상영회차는 하나의 영화와 시작 시각을 가진다. |
| FR-03 | MUST | 좌석은 행과 번호로 표현되며, 라벨(`A-7` 형태)로 식별된다. |
| FR-04 | MUST | 예약은 회차·좌석·예약자 이메일로 생성되며 초기 상태는 CONFIRMED다. |
| FR-05 | MUST | 예약은 cancel() 을 통해서만 CANCELLED 로 전이된다. |
| FR-06 | MUST | 입력 값이 규칙을 위반하면 예외를 던진다. |
| FR-07 | SHOULD | 같은 회차의 같은 좌석에 유효한(CONFIRMED) 예약이 둘 이상 존재할 수 없다. *→ 애플리케이션 계층(다음 스프린트)에서 저장소와 함께 구현* |

## 5. 입력 검증 규칙

| 항목 | 규칙 | 예외 |
|---|---|---|
| 영화 제목 | 공백만으로 이루어지면 안 됨 (trim 후 길이 > 0) | `Error` |
| 상영 시간 | 양의 정수여야 함 | `Error` |
| 회차 시작 시각 | 유효한 `Date` 여야 함 | `Error` |
| 좌석 행 | 비어 있으면 안 됨 | `Error` |
| 좌석 번호 | 1 이상이어야 함 | `Error` |
| 예약자 이메일 | `이름@도메인.톱레벨` 형태 | `Error` |
| 예약 상태 전이 | `CONFIRMED → CANCELLED`만 허용, 되돌리기 불가 | `Error` |

## 6. 상태 전이 (Reservation)

```
                cancel()
  CONFIRMED ───────────────→ CANCELLED
      ↑
   (생성 시점)
```

- 생성 즉시 `CONFIRMED`.
- 전이는 `cancel()` 메서드를 통해서만 발생.
- `CANCELLED`에서 다시 `cancel()` 호출 = 예외.

## 7. 인수 기준 (Acceptance Criteria)

> 각 AC는 이후 작성되는 테스트 하나 이상과 1:1로 대응한다. (불변식은 프런트/백엔드 경계와 무관하게 도메인에서 유지)

| AC | 설명 |
|---|---|
| AC-01 | 유효한 제목과 상영 시간으로 영화가 생성된다. |
| AC-02 | 빈(공백) 제목의 영화 생성은 예외를 던진다. |
| AC-03 | 0 이하의 상영 시간으로 영화 생성은 예외를 던진다. |
| AC-04 | 영화를 배우는 회차가 생성되고 시작 시각을 가진다. |
| AC-05 | 유효하지 않은 시작 시각의 회차 생성은 예외를 던진다. |
| AC-06 | 좌석 라벨은 `A-7` 형태다. |
| AC-07 | 행·번호가 같으면 같은 좌석, 다르면 다른 좌석으로 판별된다. |
| AC-08 | 잘못된 행(공백)/번호(0 이하)의 좌석 생성은 예외를 던진다. |
| AC-09 | 예약 생성 시 상태는 CONFIRMED다. |
| AC-10 | cancel() 후 상태는 CANCELLED다. |
| AC-11 | 이미 취소된 예약의 재취소는 예외를 던진다. |
| AC-12 | 잘못된 이메일로 예약 생성은 예외를 던진다. |

## 8. 비기능 요구사항

| ID | 요구사항 |
|---|---|
| NFR-01 | 도메인 코드는 순수 TS. Express, DB, UI 프레임워크 등에 **의존하지 않아야** 한다. |
| NFR-02 | 도메인 객체는 `npm run typecheck`(strict mode)를 통과해야 한다. |
| NFR-03 | 도메인 규칙은 이메일/HTTP 등 외부 진입점과 무관하게 항상 동작해야 한다. |

---

## 부록: 다음 스프린트 목표 (미리 선언)

- FR-07의 실현: `ReservationRepository` 인터페이스 + `InMemoryReservationRepository` (의존성 역전 실습)
- 애플리케이션 계층: `CreateReservation`, `CancelReservation` Use Case
- 제출용 프레젠테이션 및 HTTP 어댑터

---

## 마일스톤 진행 기록

### M2: 예약 저장소 Postgres 교체 (2026-09-23)

**목표** — 저장소 구현을 추가하고 조립 루트에서 갈아끼우는 것으로, 도메인·유스케이스·포트를 **0줄 수정**하며 DIP를 재증명한다.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-13 | `DATABASE_URL`이 설정된 환경에서 예약 저장소는 Postgres를 사용한다. |
| AC-14 | Postgres 저장소는 `save`/`findById`/`findActiveByShowtimeAndSeat`/`findActiveSeatsByShowtime`의 계약을 지킨다 (상태 재구성 포함). |
| AC-15 | `DATABASE_URL`이 없으면 SQLite로 폴백하여 기존 동작을 그대로 유지한다. |
| AC-16 | 저장소 교체 과정에서 domain/application/ports 코드가 변경되지 않는다. |

**검증**

- `postgres-reservation-repository.test.ts` (6개) — `describe.skipIf(!DATABASE_URL)` 패턴, 실제 postgres(로컬 docker / CI service container) 상에서 실행.
- 로컬: api 39(33 + pg 6) + web 15, typecheck·lint 통과.
- CI: `services.postgres` 컨테이너 + Test 스텝에 `DATABASE_URL` 주입으로 전부 초록.

**학습 메모**

- `node:sqlite`는 동기 생성자에서 마이그레이션 가능, `pg`는 async → **lazy `ensureTable()` 프로미스 패턴**으로 대체.
- DB 백업 저장소의 진짜 레드-그린은 **실제 DB가 있는 환경에서만** 발생 (스킵된 테스트가 실행되는 순간).
- PostgreSQL 18 공식 이미지는 볼륨 마운트 지점이 `/var/lib/postgresql`로 변경됨 (container log 안내).