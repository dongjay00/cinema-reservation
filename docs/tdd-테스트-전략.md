# TDD — 테스트 전략

> Test-Driven Development. **"코드를 먼저 설계하면 그 반대의 상상을 못 한다"** → 테스트부터 설계하면
> 필요 이상의 구현(DB, 프레임워크)을 미리 만들지 않게 된다. 레드 → 그린 → 리팩터.

- 작성일: 2026-09-18 (마일스톤 진행과 함께 갱신 중)
- 도구: Vitest (api · worker · web 워크스페이스별 실행, 루트 `npm test`로 집계)
- 실행: `npm run test:api` / `test:worker` / `test:web` — 또는 전체 `npm test`

## 1. 사이클 (이번에는 이미 작성돼 있는 상태로 보여드립니다)

```
[레드] 테스트 작성 → 실패 확인 (도메인 미구현)
[그린] 최소 구현 작성 → 테스트 통과
[리팩터] 중복 제거 · 가독성 → 여전히 통과
```

> 학습 관점: 지금 코드베이스에 "테스트가 이미 그린"으로 존재하지만,
> **각 테스트가 실패할 만한 이유**를 하나씩 읽어가며 따라가세요.
> 진짜 TDD 연습을 원하면 이 테스트를 지우고 다시 작성해보는 것도 좋습니다.

## 2. AC ↔ 테스트 매핑

| AC | 테스트 파일 | describe | expect 핵심 |
|---|---|---|---|
| AC-01 | `movie.test.ts` | 생성 | `title`, `durationMinutes` 보존 |
| AC-02 | `movie.test.ts` | 입력 검증 | 빈 제목 → `toThrow` |
| AC-03 | `movie.test.ts` | 입력 검증 | 0/음수 시간 → `toThrow` |
| AC-04 | `showtime.test.ts` | 생성 | `movie.title`, `startsAt` 연결 |
| AC-05 | `showtime.test.ts` | 입력 검증 | `new Date("bad")` → `toThrow` |
| AC-06 | `seat.test.ts` | 라벨 | `label === "A-7"` |
| AC-07 | `seat.test.ts` | 동등성 | `equals()` true/false |
| AC-08 | `seat.test.ts` | 입력 검증 | 빈 행/0 번호 → `toThrow` |
| AC-09 | `reservation.test.ts` | 상태 | 초기 `status === CONFIRMED` |
| AC-10 | `reservation.test.ts` | 상태 | `cancel()` 후 `CANCELLED` |
| AC-11 | `reservation.test.ts` | 상태 | 재취소 → `toThrow` |
| AC-12 | `reservation.test.ts` | 입력 검증 | 잘못된 이메일 → `toThrow` |

## 3. 테스트 파일 구조 (안티 패턴 방지)

```
packages/api/src/domain/__tests__/
├── movie.test.ts
├── showtime.test.ts
├── seat.test.ts
├── reservation.test.ts
└── events.test.ts         (M4 도메인 이벤트 기록/반출)
```

현재 전체 테스트는 **api 77 · worker 10 · web 23**입니다. api는 자체 `domain`/`application`/`infrastructure`(계약·HTTP·캐시·Redis)의 유닛·통합 테스트를, worker는 파싱·소비·아키텍처 가드를, web은 웹 도메인·유스케이스·HTTP 어댑터를 각각 담당합니다.

회의 규칙:
- **테스트는 given/when/then 문장으로**: 테스트 본문을 그렇게 읽을 수 있어야 한다.
- **도메인 규칙 테스트는 "결과로 이메일/HTTP 응답을 보지 않는다"** — 순수 단위 테스트.
- 구현 파일 옆 `__tests__` 폴더로 배치 → 리팩터 시 테스트가 함께 움직임.

## 4. 테스트 작성 규칙

1. `describe` 는 대상 + 동작 묶음, `it`은 "~하면 ~한다" 형식.
2. 예외 검증은 `expect(() => ...).toThrow(=범위로 특정)`
3. 헬퍼는 각 파일 최상단에 `const sample = () => ...` 로 "기본 생성자" 제공 (중복 감소).

## 5. 실행 방법

```bash
npm test                     # 전체: test:api → test:worker → test:web
npm run test:api             # api 77 (env 미지정 시 pg·redis 통합 일부 skip)
npm run test:worker          # worker 10
npm run test:web             # web 23
npm run test:watch --workspace @cinema/api   # 파일 변경 시 재실행 (TDD 개발 중)
npm run typecheck            # 루트: 전체 타입 검사 (strict)
```

`REDIS_URL`/`DATABASE_URL`을 주면 api·worker의 통합 테스트(pg·Redis)가 skip 없이 실행됩니다.