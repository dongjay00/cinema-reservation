import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

async function collectSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__") {
        files.push(...(await collectSourceFiles(path)));
      }
    } else if (entry.name.endsWith(".ts") && !path.endsWith(".test.ts")) {
      files.push(path);
    }
  }
  return files;
}

describe("worker 아키텍처 가드", () => {
  it("@cinema/shared 외 워크스페이스 패키지를 import하지 않는다", async () => {
    const files = await collectSourceFiles(ROOT);
    const offenders: string[] = [];
    for (const file of files) {
      const source = await readFile(file, "utf8");
      for (const line of source.split("\n")) {
        const match = line.match(/from\s+"(@cinema\/[^"]+)"/);
        if (match && match[1] !== "@cinema/shared") {
          offenders.push(`${file}: ${match[1]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
