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

### M3: 아키텍처 가드 테스트 (2026-09-23)

**목표** — "의존성은 안쪽으로 향한다"는 규칙을 테스트로 고정한다. NFR-01(도메인 순수성)의 기계적 강제.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-17 | `application` 레이어는 `infrastructure`를 import하지 않는다 (테스트 파일 포함). |
| AC-18 | `domain` 레이어는 바깥 레이어(`application`/`infrastructure`)를 import하지 않는다. |
| AC-19 | `domain`의 비테스트 파일은 서드파티·프레임워크(express·react·pg 등)를 import하지 않는다. 단 `node:*` 표준 내장은 예외. |
| AC-20 | 가드 테스트는 `npm test`(CI 포함)로 자동 실행되어 위반 시 실패한다. |

**검증**

- `src/__tests__/architecture-guard.test.ts` — api/web 동일 파일. 소스 파일의 `from "..."`를 스캔해 레이어 순위(domain 0 < application 1 < infrastructure 2 < ui 3)를 위반하면 실패.
- 검사 대상: api 40 / web 16 테스트 전부 통과, typecheck·lint 통과.

**레드→그린 (가드 첫 실전)**

- 첫 실행에서 **진짜 위반 4건** 적발: application 유스케이스 테스트 3개 파일이 `InMemory*Repository`(infrastructure)를 테스트 더블로 사용 중.
- 수정: 좁은 포트(`CreateReservationRepository`/`CancelReservationRepository`/`ShowtimeSeatsQuery`)를 구현하는 **로컬 Fake**로 대체 → infrastructure import 제거. ISP 리팩터 수혜로 Fake 구현부가 더 작아짐.

**학습 메모**

- 웹 `tsconfig.app.json`의 `"types": ["vite/client"]`가 `@types/node`를 **목록 외 배제** → 가드 테스트의 `node:fs`가 typecheck 실패. `["vite/client", "node"]`로 수정.
- 가드 테스트가 "규칙"과 "실천"의 격차를 즉시 좁힌다: 이번엔 application→infrastructure 의존이 그 대상이었음.

### M4: 도메인 이벤트 + 알림 포트 (2026-09-23)

**목표** — 예약 생성/취소라는 비즈니스 사실(사실, fact)을 **도메인 이벤트**로 표현하고, 이를 "알림" 밖으로 내보내는 **포트(포트-아웃)**를 둔다. 알림의 실사용 메커니즘(이메일·푸시 등)은 infrastructure 어댑터의 책임이며, 유스케이스는 교체를 모른다.

**설계**

- `domain/events.ts` — `DomainEvent` 인터페이스 + `ReservationCreated`/`ReservationCancelled`.
- `Reservation`이 행위 시점에 이벤트를 **기록**한다: `Reservation.create(...)` 정적 팩토리(등록 시 생성 이벤트), `cancel()`(취소 이벤트). `takeRecordedEvents()`가 기록을 꺼낸 뒤 비운다.
- **재구성 경로는 이벤트를 만들지 않는다**: 저장소가 DB에서 `new Reservation(id,...)`로 되살릴 때는 이벤트가 기록되지 않아야 한다(중복 발행 방지).
- `application/ports/event-publisher.ts` — 포트-아웃 `EventPublisher.publish(events)`.
- 유스케이스는 저장 성공 후 `takeRecordedEvents()`의 결과를 발행한다.
- `infrastructure/notification-event-publisher.ts` — 어댑터. `ReservationCreated`/`ReservationCancelled`를 받아 console로 "이메일 발송" 데모 로그를 남긴다. 실제 SMTP 연동으로 갈아끼워도 application/domain은 무변경.
- 조립 루트(`index.ts`)에서 어댑터를 유스케이스에 주입.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-21 | `Reservation.create()`는 생성 직후 `ReservationCreated` 이벤트를 기록한다. |
| AC-22 | `Reservation.cancel()`은 `ReservationCancelled` 이벤트를 기록한다. |
| AC-23 | `takeRecordedEvents()`는 기록을 한 번에 돌려주고 저장소를 비운다. |
| AC-24 | 생성/취소 유스케이스는 저장 성공 시 기록된 이벤트를 `EventPublisher`로 발행한다. |
| AC-25 | 저장소가 DB에서 예약을 재구성할 때 이벤트가 기록되지 않는다 (재발행 없음). |
| AC-26 | 알림 게재 방식(console 데모)을 바꿔도 domain/application 코드는 변경되지 않는다. |

**검증**

- domain 이벤트 테스트 + 유스케이스 이벤트 발행 테스트(로컬 FakePublisher) + 어댑터 테스트(console 스파이).
- 전체: api 40 + 신규, web 16, typecheck·lint·가드 통과.

**검증 결과**

- domain 이벤트 4개 + AC-24 발행 2개 + 어댑터 2개 신규 → api 48(42+pg 6) / web 16, typecheck·lint·가드 전부 통과.

**학습 메모**

- 이벤트는 **도메인 행위의 사실(fact)**에서만 기록한다. `Reservation.create()` 정적 팩토리는 생성 이벤트를, `cancel()`은 취소 이벤트를 기록. **재구성/재생성 경로(`new Reservation`)는 이벤트를 만들지 않는다** → DB 로드 후 중복 발행 방지.
- 이벤트는 저장 성공 후 유스케이스가 `takeRecordedEvents()`로 꺼내 발행. 유스케이스는 "누구에게 어떻게 알릴지"를 모르고 사실만 내보낸다 — 실제 이메일 연동(SMTP 등)으로 어댑터를 갈아끼워도 domain/application 무변경.
- `createApp` 기본값을 `SilentEventPublisher`로 두어 기존 supertest 호출 3곳은 건드리지 않았고, 조립 루트(index.ts)만 데모 어댑터를 명시 주입.
- AC-24 발행 2건(생성/취소)은 진짜 레드→그린. AC-26 어댑터 검증 테스트는 구현이 이미 타이핑된 뒤라 "구현 후 검증"으로 추가 (red-first 예외 1건, 고지됨).

### M5: 동시성 — 동시 예약 레이스 (2026-09-30)

**문제** — `CreateReservationUseCase`의 "확인 후 저장"(`findActiveByShowtimeAndSeat` → `save`)은 **원자적이지 않다**. 두 요청이 검사를 통과하는 사이에 서로의 INSERT를 보지 못하면 같은 좌석에 CONFIRMED가 둘 생긴다. PG는 async Pool이라 실제로 인터리빙된다.

**설계** — 방어는 두 겹.

1. 애플리케이션 사전 검사(기존): 친절한 에러 + 빠른 응답. 하지만 경쟁 조건을 못 막는다.
2. **DB 백스톱(신규)**: 부분 유니크 인덱스 `(showtime_id, seat_row, seat_number) WHERE status = 'CONFIRMED'`를 SQLite·Postgres 양쪽에 추가. 두 번째 CONFIRMED INSERT가 인덱스에 걸려 실패하고, 저장소는 그 위반을 `DuplicateReservationError`로 번역한다 → 유스케이스·라우트(409)는 무변경.

- 취소된 행은 인덱스에 포함되지 않으므로 같은 좌석의 재예약은 여전히 허용된다.
- "실패 유발 원인"은 DB마다 다르므로 각 저장소가 자기 DB의 위반을 감지한다 (sqlite `errcode`/메시지, pg `23505`).

**인수 기준**

| AC | 설명 |
|---|---|
| AC-27 | 같은 회차·좌석에 CONFIRMED가 이미 있으면 `save`는 `DuplicateReservationError`를 던진다 (경쟁 조건에서도). |
| AC-28 | CANCELLED로 풀린 좌석은 다시 CONFIRMED로 저장할 수 있다. |
| AC-29 | 동시에 N건의 같은 좌석 예약 저장 → 정확히 하나만 성공한다 (실 DB에서 검증). |

**검증**

- SQLite(메모리) 계약 2건 추가 + PG(`skipIf(!DATABASE_URL)`) 계약 2건 + **동시성 통합 테스트 1건**(`Promise.allSettled`, 실 DB 전용).
- 사전 검사 유스케이스 테스트/가드/HTTP 409 매핑은 무변경 재사용.

**검증 결과**

- 로컬(무 DB): sqlite 계약 8개 포함 44 통과 + pg 9개 스킵. 실 DB(pg): 전부 53 통과.
- AC-29 동시성 검증: 5건 `Promise.allSettled` → fulfilled 정확히 1, POST검증 조회로 CONFIRMED 1행 확인.

**학습 메모**

- "확인 후 저장"의 비원자성을 **DB 제약으로 백스톱**: 부분 유니크 인덱스 `(...) WHERE status='CONFIRMED'`가 SQLite·Postgres 공통 문법.
- `ON CONFLICT (id)` UPSERT는 **PK 충돌만** 흡수한다. 같은 좌석의 새 id INSERT는 부분 인덱스에 걸려 그대로 예외로 올라오고, 저장소가 이를 애플리케이션 에러(`DuplicateReservationError`)로 번역 → HTTP 409 매핑 재사용(유스케이스·라우트 0줄 수정).
- 위반 감지 코드는 DB마다 다름: PG `SQLSTATE 23505`, SQLite `errcode 2067`(=`SQLITE_CONSTRAINT_UNIQUE`). 저장소가 각자 자기 DB의 위반을 안다.
- 애플리케이션 사전 검사는 그대로 두는 이유: (1) 친절한 에러·빠른 응답, (2) 인덱스는 레이스 윈도우의 최종 방어. 성능·UX와 정합성은 별개 겹.

### M6: 예약 목록 / 마이페이지 (2026-09-30)

- api: `ReservationsByCustomerQuery` 포트 + `ListReservationsByCustomerUseCase` + `GET /reservations?customerEmail=`(검증 포함). 저장소 3종(sqlite/pg/in-memory) 모두 구현.
- web: `ReservationLister` 포트 + `ListReservationsUseCase` + HTTP 어댑터 + `MyReservations` 컴포넌트(App 배선, 목록 취소 지원).
- 신규 테스트: api 유스케이스 2 + 라우트 2 + 계약(sqlite/pg) 2, web 유스케이스 2 + 어댑터 1 → **api 59 / web 19**, typecheck·lint·가드·빌드 전체 통과.

**학습 메모**

- 포트를 교차 타입에 넣으면 **저장소·어댑터의 의무 구현을 compiler가 강제**한다 — "변경 누락"을 문서가 아니라 타입 시스템이 막아준다 (AC-30이 테스트, 교차 타입이 컴파일 타임 강제).
- api와 웹의 쿼리 포트 이름이 다르다(`ReservationsByCustomerQuery` vs `ReservationLister`) — 각 경계가 자기 유비쿼터스 언어로 표현하는 것이 인정된 지점.
- 웹은 `erasableSyntaxOnly`라 **생성자 파라미터 프로퍼티 금지** — 이번에 2번 걸림(테스트 Fake + 유스케이스). 웹 정식 패턴은 필드 선언 + 생성자 대입.
- GET 쿼리 파라미터 검증(누락/형식)은 **진입점(라우트)의 책임**이라 유스케이스는 검증 없는 얇은 위임자로 유지.
- 실수 2건 인정: 테스트의 import 경로(`./list-reservations` → `../use-cases/list-reservations`), 소스와 무관하게 describe를 잘못된 블록에 중첩. 구조는 작게 자주 확인하는 것이 낫다.
- UI 컴포넌트 렌더 테스트는 이 프로젝트에 React Testing Library가 없어 스코프에서 제외(AC-33의 데이터 흐름은 유스케이스·어댑터 테스트가 증명, 렌더는 typecheck·빌드 + 수동 확인).

### M6: 예약 목록 / 마이페이지 (2026-09-30)

**목표** — 인증 없이 **이메일로 "내 예약"**을 조회하고 목록에서 취소까지 할 수 있게 한다. api는 조회 쿼리 포트, 웹은 프레젠테이션 쿼리(그리고 그 쿼리가 바라보는 DTO)를 추가.

**설계**

- api 포트: `ReservationsByCustomerQuery { findByCustomerEmail(email) }` — `ReservationRepository` 교차 타입에 추가(도메인 정렬 없이 상태 포함 전체 반환).
- api 유스케이스: `ListReservationsByCustomerUseCase`.
- api 라우트: `GET /reservations?customerEmail=...` → 200 `ReservationDto[]`. 이메일 누락/형식 불일치 → 400.
- 저장소 3종(sqlite/pg/in-memory) 모두 `findByCustomerEmail` 구현 (기존 409·404 매핑과 무관하게 병렬 추가).
- 웹 포트: `ReservationLister { listByCustomerEmail(email) }` — `ReservationRepository` 교차 타입에 추가.
- 웹 유스케이스: `ListReservationsUseCase`. HTTP 어댑터 `GET /reservations` → 배열 DTO → 도메인 변환.
- 웹 UI: `MyReservations` 컴포넌트 — 이메일 입력 → 조회 → 목록(좌석·회차·상태 + CONFIRMED면 취소 버튼). App에 배선.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-30 | 이메일로 본인 예약 목록을 조회하면 상태(CONFIRMED/CANCELLED) 포함 전부 반환된다. |
| AC-31 | 이메일이 누락됐거나 형식이 잘못되면 400을 반환한다. |
| AC-32 | 유스케이스는 쿼리 포트(어댑터 무관)를 통해 목록을 얻는다. |
| AC-33 | 웹: 조회 결과 좌석·회차·상태가 렌더되고, CONFIRMED 예약은 목록에서 취소할 수 있다. |

**검증**

- api: 유스케이스 1 + 라우트 2 + 저장소 계약(sqlite/pg) 각 1 → 신규 5.
- web: 유스케이스 1 + HTTP 어댑터 1.
- 전체 `npm test` + typecheck·lint·가드.

**학습 메모** (완료 시 갱신)