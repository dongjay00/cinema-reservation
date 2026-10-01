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

**목표** — 인증 없이 **이메일로 "내 예약"**을 조회하고 목록에서 취소까지 할 수 있게 한다. api는 조회 쿼리 포트, 웹은 프레젠테이션 쿼리(그리고 그 쿼리가 바라보는 DTO)를 추가.

**설계**

- api 포트: `ReservationsByCustomerQuery { findByCustomerEmail(email) }` — `ReservationRepository` 교차 타입에 추가(도메인 정렬 없이 상태 포함 전체 반환).
- api 유스케이스: `ListReservationsByCustomerUseCase`.
- api 라우트: `GET /reservations?customerEmail=...` → 200 `ReservationDto[]`. 이메일 누락/형식 불일치 → 400.
- 저장소 3종(sqlite/pg/in-memory) 모두 `findByCustomerEmail` 구현 (기존 409·404 매핑과 무관하게 병렬 추가).
- 웹 포트: `ReservationLister { listByCustomerEmail(email) }` — `ReservationRepository` 교차 타입에 추가.
- 웹 유스케이스: `ListReservationsUseCase`. HTTP 어댑터 `GET /reservations` → 배열 DTO → 도메인 변환.
- 웹 UI: `MyReservations` 컴포넌트 — 이메일 입력 → 조회 → 목록(좌석·회차·상태 + CONFIRMED면 취소 버튼). App에 배선.
- 신규 테스트: api 유스케이스 2 + 라우트 2 + 계약(sqlite/pg) 2, web 유스케이스 2 + 어댑터 1 → **api 59 / web 19**, typecheck·lint·가드·빌드 전체 통과.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-30 | 이메일로 본인 예약 목록을 조회하면 상태(CONFIRMED/CANCELLED) 포함 전부 반환된다. |
| AC-31 | 이메일이 누락됐거나 형식이 잘못되면 400을 반환한다. |
| AC-32 | 유스케이스는 쿼리 포트(어댑터 무관)를 통해 목록을 얻는다. |
| AC-33 | 웹: 조회 결과 좌석·회차·상태가 렌더되고, CONFIRMED 예약은 목록에서 취소할 수 있다. |

**학습 메모**

- 포트를 교차 타입에 넣으면 **저장소·어댑터의 의무 구현을 compiler가 강제**한다 — "변경 누락"을 문서가 아니라 타입 시스템이 막아준다 (AC-30이 테스트, 교차 타입이 컴파일 타임 강제).
- api와 웹의 쿼리 포트 이름이 다르다(`ReservationsByCustomerQuery` vs `ReservationLister`) — 각 경계가 자기 유비쿼터스 언어로 표현하는 것이 인정된 지점.
- 웹은 `erasableSyntaxOnly`라 **생성자 파라미터 프로퍼티 금지** — 이번에 2번 걸림(테스트 Fake + 유스케이스). 웹 정식 패턴은 필드 선언 + 생성자 대입.
- GET 쿼리 파라미터 검증(누락/형식)은 **진입점(라우트)의 책임**이라 유스케이스는 검증 없는 얇은 위임자로 유지.
- 실수 2건 인정: 테스트의 import 경로(`./list-reservations` → `../use-cases/list-reservations`), 소스와 무관하게 describe를 잘못된 블록에 중첩. 구조는 작게 자주 확인하는 것이 낫다.
- UI 컴포넌트 렌더 테스트는 이 프로젝트에 React Testing Library가 없어 스코프에서 제외(AC-33의 데이터 흐름은 유스케이스·어댑터 테스트가 증명, 렌더는 typecheck·빌드 + 수동 확인).

### M7: ORM 교체 — raw SQL → Drizzle (2026-09-30)

**목표** — 저장소의 데이터 접근 계층을 `pg`·`node:sqlite` **raw SQL에서 Drizzle ORM으로 교체**한다. 포트·도메인·유스케이스는 그대로 두고, 같은 계약 테스트(AC-27~30)가 신규 구현을 그대로 검증하는 "교체의 안전망"을 실습한다.

**설계**

- 의존성: `drizzle-orm` + `drizzle-kit`(dev) + `better-sqlite3` + `@types/better-sqlite3`(dev). pg는 `drizzle-orm/node-postgres` 드라이버의 피어로 유지.
- `node:sqlite`(`DatabaseSync`)는 **Drizzle 공식 드라이버가 없어** 기본 SQLite 드라이버를 `better-sqlite3`(동기·메모리 지원)로 전환.
- `infrastructure/schema.ts`: Drizzle 스키마 2종(`sqliteTable`/`pgTable`, 컬럼 동일). **테이블/부분 유니크 인덱스는 기존 DDL 부트스트랩 재사용**(`CREATE TABLE IF NOT EXISTS` + `WHERE status='CONFIRMED'` 인덱스) — 원자성 백스톱(M5)이 ORM 위에서도 DB 레벨로 유지됨을 재증명.
- 신규 저장소 `DrizzleSqliteReservationRepository` / `DrizzlePostgresReservationRepository`: 기존 6계약(`save` UPSERT·`findById`·`findActiveByShowtimeAndSeat`·`findActiveSeatsByShowtime`·`findByCustomerEmail`)을 Drizzle 쿼리로 재구현. 유니크 위반(SQLite `SQLITE_CONSTRAINT_UNIQUE`/PG `23505`)을 `DuplicateReservationError`로 번역.
- 기존 raw 저장소 2개는 **학습용 레거시로 유지**(미사용·미테스트 — README에 명시). 계약 테스트 2파일은 **셋업만 신규 저장소로 교체**(본문·예상 0자 변경) — 즉 교체가 테스트 수를 늘리지 않고 기존 증명을 이어받는다.
- 조립 루트(index.ts)만 드라이버·클라이언트 생성 주입.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-34 | Drizzle 저장소가 기존 계약(조회·저장·레이스 백스톱·이메일 조회)을 그대로 통과한다. (실질: M5·M6 계약 테스트 스위트 무수정 통과) |
| AC-35 | 부분 유니크 인덱스 백스톱이 ORM 위에서도 DB 레벨로 동작한다 (AC-27/28/29 재통과). |
| AC-36 | 도메인·포트·유스케이스·라우트가 **0줄 수정**으로 교체된다 (DIP 재증명). |

**검증** — 전체 `npm test`(sqlite 계약 8 + pg 계약 9 포함) + typecheck·lint·가드·빌드.

**학습 메모**

- 드라이버는 ORM이 지원하는 것으로 골라야 한다: Drizzle은 `node:sqlite` 공식 드라이버를 주지 않아 기본 SQLite를 `better-sqlite3`로 전환, pg는 `node-postgres` 유지. "포트는 저장소를 주입받지 ORM/드라이버 선택은 인프라 결정"이라는 시야가 생김.
- 스키마 컬럼을 도메인 타입으로 못 박는다: `status`를 평범한 `text`로 두면 조회 결과가 `string`이라 저장소의 `ReservationRow`와 충돌 → `$type<ReservationStatus>()`로 스키마에서 해결하고, 저장소 코드는 0줄 변경으로 타입이 따라온다. Drizzle의 "쿼리 문법 = 타입" 관점.
- 드라이버마다 예외 형태가 다르다: better-sqlite3는 원본 에러(`error.code = SQLITE_CONSTRAINT_UNIQUE`)를 그대로 던지지만 node-postgres는 `Failed query:` 래퍼를 씌워 원인이 `error.cause.code`로 밀려난다. → `isUniqueViolation`은 **cause 체인 탐색**으로 만들어 두 드라이버를 한 함수로 커버. "오류 번역"도 결국 어댑터 경계의 책임임을 재확인.
- 계약 테스트의 안전망 원리: raw 저장소가 통과했던 assertion이 **본문 0자 변경**으로 Drizzle 저장소를 재통과 → 테스트 파일명은 "구현"이 아니라 "DB 방언별 계약"을 가리킨다. 교체 증명은 "양쪽 동시 실행"이 아니라 "동일한 계약이 다른 구현 위에서 성립"하는 것이다.
- M5의 부분 유니크 인덱스는 여전히 DDL 부트스트랩에 남아 있어, ORM upsert(`onConflictDoUpdate`)와 무관하게 DB 레벨에서 레이스를 방어(AC-35 재통과).
- DIP 재증명: 조립 루트(index.ts)만 ~10줄 변경, 도메인·포트·유스케이스·라우트 0줄(AC-36). 소유권이 애플리케이션 쪽 포트에 있으니 저장소 구현체가 통째로 갈렸다.
- 결과: api 59(sqlite 계약 8 + pg 계약 9) + web 19, typecheck·lint·빌드·가드 통과.

### M8: 쇼타임 좌석 조회 캐싱 (2026-09-30)

**목표** — 읽기 중핫 경로인 `GET /showtimes/:id/seats`(`ShowtimeSeatsQuery`)를 **TTL 기반 인메모리 캐시**로 보강한다. 캐시는 새 포트로 두고, 기존 좌석 조회 포트를 **데코레이터**로 감싼다 — 쓰기 경로·유스케이스·도메인은 건드리지 않는 확장(OCP).

**설계**

- 포트(`application/ports/cache.ts`): `Cache { get<T>(key): Promise<T|undefined>; set<T>(key, value, ttlMs): Promise<void> }` — 비동기로 두어 이후 Redis 등 원격 캐시로 교체 가능.
- 구현(`infrastructure/in-memory-cache.ts`): `Map` + `expiresAt`, **주입 가능한 clock**(`now()`)으로 TTL 테스트를 결정적으로 만듦. 조회 시 만료 항목은 지연 삭제.
- 데코레이터(`infrastructure/caching-showtime-seats-query.ts`): `CachingShowtimeSeatsQuery implements ShowtimeSeatsQuery` — `delegate` 위임 + 캐시 조회. 키 `showtime:{id}:seats`, 기본 TTL 5초(주입 가능). 캐시 적중 시 원본 쿼리 호출 생략.
- 조립: `createApp`에 선택 인자 `seatsQuery: ShowtimeSeatsQuery = repository` 추가(기존 호출부 무변경), `index.ts`만 데코레이터를 감싸서 주입.
- **Redis 어댑터(M8.5)**: `Cache` 포트 구현으로 `RedisCache`(ioredis) 추가 — `JSON.stringify/parse` + TTL은 ms 단위 `PX`. 조립 루트가 `REDIS_URL` 제공 시 Redis, 아니면 InMemory 선택. 원격 캐시라 도메인 객체를 담을 수 없어 데코레이터가 **JSON 안전한 프로젝션(`{row, number}[]`)을 캐시하고, 힛 시 `Seat`으로 재구성**한다.
- **무효화 정책**: 기본은 TTL 만료 의존(쓰기 원자성·동시성은 M5가 담당). 스코프 밖 후속 과제로 기록해 두었던 **이벤트 기반 무효화**(쓰기 발생 시 `delete(key)`)는 M10 정리 라운드에서 `InvalidatingEventPublisher`로 구현 — TTL 격차가 사라짐.
- 신규 테스트: `in-memory-cache.test.ts`(hit/miss/만료 3) + `caching-showtime-seats-query.test.ts`(첫 조회 위임·TTL 내 재조회 위임 1회·TTL 만료 후 재위임·showtime별 키 분리 — 3, spy 포트 사용).

**인수 기준**

| AC | 설명 |
|---|---|
| AC-37 | 첫 조회는 위임 포트에서 가져오고, TTL 내 동일 쇼타임 재조회는 캐시에서 반환한다(위임 호출 1회). |
| AC-38 | TTL 만료 후 조회는 다시 위임 포트에서 가져온다. |
| AC-39 | 쇼타임별로 캐시 키가 분리되어 서로 간섭하지 않는다. |
| AC-40 | 도메인·기존 포트·유스케이스·라우트 0줄 수정 (데코레이터 + 포트 소유권 재증명). 캐시 도입이 TTL 지연이라는 명시적 트레이드오프를 수반한다는 것을 기록. |
| AC-41 | `REDIS_URL` 제공 시 캐시는 Redis 어댑터로 동작한다 (JSON 왕복 + PX ms TTL). |
| AC-42 | 캐시에는 JSON 안전한 프로젝션만 담고, 힛 시 도메인 객체(`Seat`)로 재구성한다. |
| AC-43 | 유스케이스·포트·라우트 0줄 수정으로 캐시 구현이 스왑된다 (InMemory ⇄ Redis). |

**검증**

- api: 신규 캐시 단위 3 + 데코레이터 3 → 59 → 65, Redis 어댑터 4(M8.5, `REDIS_URL` 제공 시) → 69. 전체 `npm test` + typecheck·lint·가드·빌드.

**학습 메모**

- 캐시도 "포트"다: 캐시 구현은 인프라, 계약은 애플리케이션이 소유 → Redis로 바꿔도 데코레이터·유스케이스는 무수정. 포트 소유권의 또 한 사례.
- OCP를 데코레이터로: 기존 `ShowtimeSeatsQuery` 구현을 수정하지 않고 **같은 포트를 구현하는 새 클래스로 감싸** 읽기 경로만 보강. 쓰기·도메인은 0줄(AC-40).
- 테스트 결정성: 캐시 만료를 기다리는 `setTimeout` 대신 **주입 가능한 clock(`now()`)을 생성자로** 받아 가짜 시계로 만료를 순간 이동 — 단위 테스트가 빨라지고 결정적.
- 네트워크 왕복을 줄이는 곳은 좁은 읽기 포트(`ShowtimeSeatsQuery`)가 최적 — ISP로 분리된 포트 덕에 "읽기만 캐시"라는 의도를 정확히 표현.
- TTL은 트레이드오프: 예약 직후 최대 5초간 좌석 목록이 늙을 수 있음(M5의 원자성 백스톱이 최종 정확성은 보장하므로 충돌 예약은 409). M10에서 이 간극을 **이벤트 기반 무효화**(`InvalidatingEventPublisher` — M4 도메인 이벤트에 `showtimeId`, M8 캐시에 `delete`)로 닫았다.
- 결과: api 65(sqlite 계약 8 + pg 계약 9 포함) + web 19, typecheck·lint·빌드·가드 통과. "좌석 목록을 다섯 번 연속 조회하면 DB는 한 번만 친다".
- Redis 스왑(M8.5): 캐시 계약 그대로, 구현만 ioredis로 교체 — 포트 소유권의 재현. 다만 **원격 캐시는 "경계에선 전송 가능한 형태로 변환"을 강제**한다: `Seat` 클래스 인스턴스는 직렬화되면 프로토타입/`equals()`/`label` getter를 잃으므로, 데코레이터가 프로젝션(`{row,number}[]`)만 캐시하고 힛 시 재구성. 캐시 계약은 "JSON 안전 데이터"라는 암묵적 규칙이 생겼고 InMemory·Redis 모두 준수. TTL은 `EX`(초 단위) 대신 `PX`(ms)로 포트의 ms 규약을 유지.
- 결과: api 69 + web 19(Redis 테스트는 로컬/CI 모두 `REDIS_URL` 있어서 실제 실행, 없으면 skip).

### M9: MSA 기초 — 이벤트가 서비스 경계를 건넌다 (2026-09-30)

**목표** — M4의 도메인 이벤트가 **같은 프로세스의 console 출력이 아니라 진짜 별도 서비스로 전달**되는, "서비스 분리 + 비동기 통신"의 최소 버전을 실습한다. api(**작성자**)와 신규 `@cinema/worker`(**구독자**)로 쪼갠다. 브로커는 Kafka 대신 **Redis Stream**을 사용(consumer group·ACK라는 개념은 동일, 이미 확보된 인프라).

**설계**

- **shared 계약**: `ReservationEventDto`(판별 유니온 — `ReservationCreated`/`ReservationCancelled`) + `RESERVATION_EVENT_STREAM = "stream:reservations"` 상수. DTO 계약은 shared가 소유하므로 작성자/구독자가 같은 타입으로 직렬화·역직렬화.
- **api**: `RedisStreamEventPublisher implements EventPublisher`(M4 포트 재사용, 유스케이스·도메인 0줄) — 이벤트를 DTO로 변환(`toReservationEventDto`, 순수 함수) → `XADD stream:* payload <JSON>`. 조립 루트에서 `NotificationEventPublisher` 교체.
- **worker(신규 워크스페이스)**: 자체 tsconfig/vitest, 의존은 `@cinema/shared` + `ioredis`뿐. `NotificationWorker`가 `XREADGROUP GROUP notifier COUNT 10 BLOCK 1000 STREAMS >`로 소비 → 파싱(`parseReservationEvent`, 순수) → `NotificationSink.notify`(console 데모) → `XACK`. `ensureGroup()`으로 그룹 신규 생성(`MKSTREAM`, BUSYGROUP 무시).
- **전달 보증**: at-least-once(XACK에 의존) — 중복·재처리 가능성을 인지하고, **멱등 처리(추적 id 기반 중복 방지)는 스코프 밖**으로 문서화.
- **한계 명시**: `publish()`는 `save()` 이후 호출이라 프로세스 중단 시 이벤트 손실 위험이 있음 → **transactional outbox**(예약+이벤트 row를 같은 트랜잭션에)가 다음 진화 지점으로 남음.
- **테스트**: api — DTO 매핑(순수) 2 + 발행(Redis 선택 통합) 1. worker — 파싱 2 + `runOnce`(가짜 Redis 주입) 1 + 통합(Redis 선택) 1 + 아키텍처 가드 1.

**인수 기준**

| AC | 설명 |
|---|---|
| AC-44 | api 어댑터가 이벤트를 Redis Stream으로 `XADD` 발행한다(페이로드 JSON, shared DTO 계약). |
| AC-45 | worker가 consumer group으로 소비해 알림 처리 후 `XACK`한다. |
| AC-46 | api 애플리케이션(유스케이스·도메인·라우트) 0줄 변경 — 포트 교체만으로 작성자측 완료. |
| AC-47 | 웹 0줄 변경(외부 서비스 분리). `REDIS_URL` 미제공 시 기존 인메모리 경로로 폴백. |

**검증**

- api: 신규 3(`REDIS_URL` 제공 시) → **72**, worker: 신규 6(통합 포함) → **6**, web 19. 전체 `npm test`(api → worker → web) + typecheck·lint·빌드.

**학습 메모**

- 서비스를 실제로 쪼갰다: api(작성자) ↔ worker(구독자)는 **`@cinema/shared` 계약으로만 결합**. `ReservationEventDto`가 "선(send)에는 쓰고 받는 쪽이 읽는" 두 서비스 사이의 계약이 됨.
- 작성자 입장의 포트: `EventPublisher`가 "알림을 발신한다"는 의도만 남기고, 전달 방식(console → Redis Stream)은 조립 루트에서 교체 — 도메인·유스케이스 0줄(AC-46).
- **at-least-once 체감**: `XREADGROUP` + `XACK`. "읽었지만 ACK 전에 죽으면 그 메시지는 다른 소비자에게 다시 배달된다" → 중복 재처리의 대가를 멱등으로 치러야 한다. 이번엔 관찰만 하고 멱등(추적 id)은 스코프 밖으로 명시.
- 실수 3건(모두 "드라이버 타입을 믿지 말고 실제 출력을 찍어보라"로 정리):
  - 리모트 반환 형태가 명령마다 다르다 — `xreadgroup`은 `[stream, entries]`로 감싸지만 **`xrevrange`/`xrange`는 `[id, fields]` 평평 목록**. 잘못 가정해서 `fields`의 두 번째 글자 `"a"`를 `JSON.parse`했다.
  - Stream 필드는 `[키,값]` 튜플이 아니라 **평평한 `string[]`**(`["payload","{...}"]`). 그리고 ioredis 타입은 **null 허용**이라 `?? []`로 방어.
  - `XGROUP CREATE ... $`는 **그룹 생성 이후 메시지만** 배달 → "브로커 먼저, 발행 나중" 순서가 맞다(통합 테스트에서 `ensureGroup`을 `xadd`보다 먼저).
- 테스트의 캐시 키 위생: 고정 키 + 긴 TTL은 **이전 실행의 캐시가 살아 있어 첫 조회가 캐시 적중**하는 flake를 만든다 → 테스트 선두에서 `del`(AC-42가 이전 결과로 2회 연속 실패한 사례).
- 결과: api 72(무 env 57+15 skip) / worker 6(무 env 5+1 skip) / web 19. 전체 가드(worker는 `@cinema/shared` 외 워크스페이스 import 금지) 통과.
- 남은 과제(문서로만): transactional outbox(손실 방어), 이벤트 멱등(중복 소비 방어).

### M10: 정리 라운드 — 전체 리뷰 기반 수정 (2026-10-01)

**목표** — M1~M9가 모두 끝난 뒤, 변경분에 대한 **전체 코드·문서 리뷰**를 수행하고 발견된 버그와 스테일 문서를 정리한다(기능 추가 아님).

**수정 (코드)**

- **이벤트 기반 캐시 무효화 구현**(M8의 후속 과제를 실제로 연결): `Cache` 포트에 `delete(key)` 추가 · `InMemoryCache`/`RedisCache` 구현 · `showtimeSeatsCacheKey()` 공유 · 신규 `InvalidatingEventPublisher`(M4 도메인 이벤트의 `showtimeId`로 키 삭제, 캐시 오류는 fail-open)를 조립 루트에서 감싸 주입.
- 이를 위해 `ReservationCancelled` 도메인 이벤트와 shared DTO에 **`showtimeId` 필드 추가**(이벤트 자기포함성 — "어느 회차가 취소됐는지" 이벤트만으로 앎). api·worker 모두 DTO 계약 갱신.
- **워커 하드닝**: 포이즌 메시지가 루프를 죽이던 문제 → 메시지 단위 try/catch(에러 로그 + **ACK하지 않고 남김** = at-least-once 유지), `XREADGROUP` 단일 클라이언트 유지, `main.ts`에 graceful shutdown(`AbortSignal` + `SIGINT`/`SIGTERM` → `redis.quit()`)·`redis.on("error")`·fatal 로그 추가.
- **웹 오류 매핑**: 400/409/404 응답의 도메인 메시지를 버리고 상태 코드만 남기던 것을, 응답 본문 `{ error }` 유지로 수정(JSON 아닌 응답은 상태 코드 폴백). `seatLabel` 파싱은 `split("-")` → **`lastIndexOf` 기준**(row에 하이픈 안전). `App.tsx`에 fetch `.catch` 추가 및 `refreshSeats` 가드.
- **의존성/하이젠**: api·web `package.json`에 `@cinema/shared` 선언(hoisting 심링크 의존 제거) · `index.ts` Redis 클라이언트 2개 → 1개 공유 · 웹 TS 버전을 루트 TS7로 통일(웹 devDep `typescript ~6` 제거).

**수정 (문서)**

- SDD 자체: 이전에 **M6 섹션이 2개**(M5 뒤 + M9 뒤)로 중복 — 병합해 하나로 정리(AC-30~33 포함).
- `packages/api`·`packages/web`·`packages/shared` README와 `docs/tdd-테스트-전략.md`·루트 README에 남아있던 스테일 수치·구조 표기(테스트 수, better-sqlite3/Drizzle, `components` 레이어 위치, 이벤트 계약 등) 갱신.

**검증** — api **77**(무 env 61+16 skip) / worker **10**(무 env 9+1 skip) / web **23**. typecheck·lint·빌드·전체 가드 통과.