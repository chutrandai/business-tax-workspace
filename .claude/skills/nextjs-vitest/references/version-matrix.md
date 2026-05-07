# Version Matrix — Next.js × Vitest × React Testing Library

## Bảng tổng hợp compatibility

| Next.js | React | Vitest | @testing-library/react | @vitejs/plugin-react | Node.js tối thiểu |
|---|---|---|---|---|---|
| 13.0 – 13.3 | 18.x | 0.28 – 0.34 | 14.x | 3.x | 16.x |
| 13.4 – 13.5 | 18.x | 0.34 – 1.6 | 14.x | 4.x | 18.x |
| **14.x** | 18.x | **1.x – 2.x** | **14.x – 15.x** | **4.x** | **18.17+** |
| **15.0 – 15.x** | **18.x hoặc 19.x** | **2.x** | **14-15.x** (React 18) / **16.x** (React 19) | **4.x** | **18.18+** |

### Dependency versions đề xuất (stable, tháng 03/2025)

#### Next.js 14 + React 18

```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^14.3.1",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^25.0.1",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

#### Next.js 15 + React 18

```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^15.0.6",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^26.0.0",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

#### Next.js 15 + React 19 (📌 cần RTL 16)

```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^16.2.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^26.0.0",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

> **Lý do RTL 16 cho React 19**: React 19 thay đổi React.act() API và concurrent rendering internals. RTL 15 sẽ báo warning hoặc lỗi với React 19.

---

## Vitest 1.x vs 2.x — Thay đổi quan trọng

| Tính năng | Vitest 1.x | Vitest 2.x |
|---|---|---|
| Browser mode | Experimental | Stable (nhưng cần cấu hình riêng) |
| `vi.useFakeTimers` API | Cơ bản | Mở rộng thêm `advanceTimersByTimeAsync` |
| Pool mặc định | `forks` | `forks` (giữ nguyên) |
| Snapshot format | Basic | Imporved (minor) |
| `globals: true` | ✅ | ✅ |

**Với Next.js thông thường (JSDOM)**, Vitest 1.x và 2.x dùng cú pháp giống nhau — không có breaking change.

---

## App Router vs Pages Router

### App Router (Next.js 13.4+)

| Module | Cần mock trong test? | Cách mock |
|---|---|---|
| `next/navigation` (useRouter, usePathname, useSearchParams) | ✅ Có | `vi.mock('next/navigation', ...)` |
| `next/headers` (cookies, headers) | ✅ Có — chỉ dùng trong Server Component | Mock toàn bộ module |
| `next/cache` (revalidatePath, revalidateTag) | ✅ Có | `vi.mock('next/cache', ...)` |
| `next/image` | Thường không cần | Nếu cần: mock thành `<img>` thuần |
| `next/link` | ❌ Không cần | Hoạt động ngay trong JSDOM |

### Pages Router (Next.js < 13, hoặc `/pages`)

| Module | Cần mock? | Cách mock |
|---|---|---|
| `next/router` (useRouter) | ✅ Có | `vi.mock('next/router', ...)` |
| `next/image` | Thường không cần | Nếu cần: mock thành `<img>` thuần |
| `next/link` | ❌ | Hoạt động ngay |

---

## Async Server Components — Giới hạn của Vitest

### Tại sao Vitest không hỗ trợ async Server Components?

Async Server Components chạy trên React Server runtime — một runtime riêng biệt với React DOM. Môi trường JSDOM của Vitest chỉ giả lập browser DOM, không bao gồm Server runtime. Do đó, khi render một `async function Component()` trong JSDOM, React sẽ báo lỗi.

### Giải pháp thay thế

| Mục tiêu | Giải pháp |
|---|---|
| Test data fetching logic | Tách ra thành standalone async function → test bình thường |
| Test UI khi có data | Dùng Synchronous Server Component hoặc Client Component với prop data |
| Test toàn bộ page flow | Playwright (E2E) |
| Test với MSW (mock network) | Kết hợp MSW + Client Component |

---

## Cấu hình nâng cao

### Environment per file

Có thể override environment cho từng file test:

```ts
// __tests__/util.test.ts
// @vitest-environment node   ← không cần DOM, chạy nhanh hơn

import { myUtil } from '../lib/myUtil'
```

### Coverage với c8 hoặc istanbul

```ts
// vitest.config.mts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',          // hoặc 'istanbul'
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
})
```

```bash
# Cần thêm package cho coverage
pnpm add -D @vitest/coverage-v8
# hoặc
pnpm add -D @vitest/coverage-istanbul
```
