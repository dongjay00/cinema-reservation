# 영화관 좌석 예매 — Clean Architecture 실습 프로젝트

![CI](https://github.com/dongjay00/cinema-reservation/actions/workflows/ci.yml/badge.svg)

Clean Architecture · 객체지향 · SOLID를 **SDD → DDD → TDD** 스프린트 워크플로우로 익히기 위해 만든 풀스택 프로젝트입니다. 영화 회차를 선택하고 좌석을 예약/취소하는 간단한 서비스이지만, **핵심 비즈니스 로직을 도메인에 두고 인프라(HTTP·DB·UI)로부터 격리**하는 구조를 갖습니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React 19 · Vite · TypeScript |
| 백엔드 | Express 5 · SQLite(기본) — 선택적으로 Postgres 18 |
| 테스트 | Vitest + Supertest (api 40, web 16) + 아키텍처 가드 |
| 린트 · 포맷 | Biome (루트 단일 설정) |
| CI | GitHub Actions (lint · typecheck · test · build + postgres service) |

## 모노레포 구조

```
clean-architecture/
├─ packages/shared   프론트/백엔드 간 공유 DTO 계약
├─ packages/api      Express API (도메인 · 유스케이스 · 인프라)
├─ packages/web      React 클라이언트 (동일한 레이어 미러)
└─ docs/             SDD/DDD/TDD 방법론 문서
```

## 아키텍처: "안쪽으로 향하는 의존성"

양쪽 패키지 모두 4개 레이어로 나뉘며, **의존성은 항상 안쪽(도메인)을 향합니다**.

```
domain         비즈니스 규칙 (예약·좌석·회차 검증) — 외부 지식 없음
  ↑
application    유스케이스 + 포트(인터페이스) + 오류
  ↑
infrastructure HTTP 어댑터 · 저장소 구현 · 조립(Composition Root)
```

핵심 규칙:

- **포트의 소유권은 애플리케이션(안쪽)** — 저장소 구현은 바깥에서 갈아끼운다 (실제로 인메모리 → SQLite 교체 시 도메인 코드는 한 줄도 안 바뀌었음).
- **유스케이스는 쓰는 기능만 의존**(ISP): `CreateReservationRepository` / `CancelReservationRepository` / `ShowtimeSeatsQuery`로 분리된 좁은 인터페이스.
- **DTO 계약은 shared**가 소유, 각 패키지는 계약을 구현하는 어댑터만 가짐.

상세 방법론 문서: [`docs/sdd-요구사항-명세.md`](docs/sdd-요구사항-명세.md) · [`docs/ddd-도메인-모델.md`](docs/ddd-도메인-모델.md) · [`docs/tdd-테스트-전략.md`](docs/tdd-테스트-전략.md)

## 빠른 시작

```bash
npm install

npm run dev:api    # API @ http://localhost:4000 (DB 미지정 시 SQLite)
npm run dev:web    # 웹 @ http://localhost:5173
```

브라우저에서 `localhost:5173` 접속 → 회차 선택 → 좌석 예약/취소.

### Postgres로 실행 (선택)

```bash
docker compose up -d          # postgres 18 컨테이너
DATABASE_URL=postgres://cinema:cinema@localhost:5432/cinema npm run dev:api
```

`DATABASE_URL`을 주면 API가 Postgres 저장소를 사용합니다. 주지 않으면 SQLite 폴백 — 저장소 선택은 `index.ts`(Composition Root) 한 곳에서만 일어납니다.

## 스크립트

| 명령 | 동작 |
|---|---|
| `npm run dev:api` / `dev:web` | 개발 서버 (tsx watch / vite) |
| `npm test` | api + web 전체 테스트 (48개) |
| `npm run test:api` / `test:web` | 각 워크스페이스 테스트 |
| `npm run typecheck` | 전 워크스페이스 타입 검사 |
| `npm run lint` | biome 검사 (포맷 + 린트) |
| `npm run lint:fix` | biome 자동 수정 |
| `npm run format` | biome 포맷만 적용 |

## 패키지 문서

- [API](packages/api/README.md) — 엔드포인트, 레이어 구조
- [Web](packages/web/README.md) — 프론트 구조
- [Shared](packages/shared/README.md) — 공유 계약

## 진행 로드맵

| # | 마일스톤 | 상태 |
|---|---|---|
| 1 | CI (GitHub Actions) | ✅ |
| 2 | Postgres 저장소 (raw pg, env 교체) | ✅ |
| 3 | 아키텍처 가드 테스트 | ✅ |
| 4 | 도메인 이벤트 + 알림 포트 |
| 5 | 동시성/이중 예약 race |
| 6 | 예약 목록/마이페이지 |
| 7 | ORM 교체 (raw pg → Drizzle/Prisma) |
| 8 | 캐싱 |
| 9 | MSA 기초 |