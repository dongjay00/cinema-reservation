import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));

const LAYER_RANK: Record<string, number> = {
  domain: 0,
  application: 1,
  infrastructure: 2,
  ui: 3,
};

function layerNameOf(file: string): string {
  const rel = relative(packageRoot, file).split(sep).join("/");
  if (rel.startsWith("src/domain")) return "domain";
  if (rel.startsWith("src/application")) return "application";
  if (rel.startsWith("src/infrastructure")) return "infrastructure";
  return "ui"; // src 루트(부트스트랩·App.tsx·main.tsx)와 components/는 가장 바깥층
}

function isTestFile(file: string): boolean {
  return (
    file.includes("__tests__") ||
    file.endsWith(".test.ts") ||
    file.endsWith(".test.tsx")
  );
}

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

function importsOf(file: string): { spec: string; relative: boolean }[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => ({
    spec: m[1],
    relative: m[1].startsWith("."),
  }));
}

describe("아키텍처 가드 — 의존성은 안쪽으로 향한다", () => {
  it("모든 소스 파일이 레이어 의존성 규칙을 지킨다", () => {
    const violations: string[] = [];

    for (const file of collectSourceFiles(join(packageRoot, "src"))) {
      const sourceLayer = layerNameOf(file);

      for (const { spec, relative: isRelative } of importsOf(file)) {
        if (!isRelative) {
          if (
            sourceLayer === "domain" &&
            !isTestFile(file) &&
            !spec.startsWith("node:")
          ) {
            violations.push(
              `${relative(packageRoot, file)}: 도메인이 외부 의존 "${spec}"을 참조함`,
            );
          }
          continue;
        }

        const targetLayer = layerNameOf(resolve(dirname(file), spec));
        if (LAYER_RANK[targetLayer] > LAYER_RANK[sourceLayer]) {
          violations.push(
            `${relative(packageRoot, file)}: ${sourceLayer}이(가) 바깥 레이어 ${targetLayer}를 import함`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
