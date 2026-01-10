// env.d.ts (프로젝트 최상위 경로에 생성)
import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}