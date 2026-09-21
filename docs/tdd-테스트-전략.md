# TDD — 테스트 전략

> Test-Driven Development. **"코드를 먼저 설계하면 그 반대의 상상을 못 한다"** → 테스트부터 설계하면
> 필요 이상의 구현(DB, 프레임워크)을 미리 만들지 않게 된다. 레드 → 그린 → 리팩터.

- 작성일: 2026-09-18
- 도구: Vitest (api 워크스페이스에서 실행)
- 실행: `npm run test:api` (루트) 또는 `npm run test --workspace @cinema/api`

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
└── reservation.test.ts
```

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
npm run test:api          # 1회 실행
npm run test:watch        # 파일 변경 시 재실행 (TDD 개발 중)
npm run typecheck         # 루트: 전체 타입 검사 (strict)
```