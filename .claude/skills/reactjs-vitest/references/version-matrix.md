# Version Matrix — React × Vite × Vitest × RTL

## Bảng tổng hợp compatibility

| React | Vite | Vitest | @testing-library/react | @testing-library/user-event | react-router-dom |
|---|---|---|---|---|---|
| **17.x** | 2.x – 3.x | 0.28 – 0.34 | 12.x – 13.x | 13.x – 14.x | 5.x hoặc 6.x |
| **18.x (18.0–18.2)** | 4.x – 5.x | **1.x – 2.x** | **14.x – 15.x** | **14.x** | **6.x** |
| **19.x** | **5.x – 6.x** | **2.x** | **16.x ⚠️** | **14.x** | **6.x – 7.x** |

> ⚠️ React 19 **bắt buộc** dùng `@testing-library/react@^16`. RTL 15 sẽ báo peer dependency warning và có thể fail khi test concurrent features.

---

## Dependency versions đề xuất (stable, tháng 03/2025)

### React 18 + Vite 5 (recommened for most projects)

```json
{
  "devDependencies": {
    "vite": "^5.4.11",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^15.0.6",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^26.0.0"
  }
}
```

### React 19 + Vite 6 (latest)

```json
{
  "devDependencies": {
    "vite": "^6.1.0",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^16.2.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^26.0.0"
  }
}
```

### React 17 (legacy, không khuyến khích mới)

```json
{
  "devDependencies": {
    "vite": "^3.2.11",
    "vitest": "^0.34.6",
    "@vitejs/plugin-react": "^2.2.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^5.17.0",
    "jsdom": "^22.0.0"
  }
}
```

---

## So sánh với Next.js testing setup

| Điểm khác biệt | Plain React (Vite) | Next.js |
|---|---|---|
| Config file | `vite.config.ts` (tích hợp) | `vitest.config.mts` (riêng) |
| Path alias plugin | Tự cấu hình trong `vite.config.ts` | `vite-tsconfig-paths` |
| Router mock | `react-router-dom` mock / `MemoryRouter` | `next/navigation` vi.mock |
| Server Components | ❌ Không có | ✅ Sync SC có thể test |
| Async Server Components | ❌ Không có | ❌ Không test được với Vitest |
| API Route test | Dùng `msw` hoặc mock trực tiếp | `NextRequest` mock trực tiếp |
| Image mock | Không cần | Mock `next/image` |

---

## react-router-dom v5 vs v6 — Thay đổi quan trọng với testing

| Tính năng | v5 | v6 |
|---|---|---|
| Wrap test | `<MemoryRouter>` | `<MemoryRouter>` hoặc `createBrowserRouter` |
| `useHistory` | `useHistory()` | ❌ Đổi thành `useNavigate()` |
| `useRouteMatch` | `useRouteMatch()` | ❌ Đổi thành `useMatch()` |
| Redirect | `<Redirect to="...">` | `<Navigate to="..." />` |
| Mock navigate | `vi.mock('react-router-dom', ...)` | Như v5, nhưng mock `useNavigate` |

> Đọc `router-test.md` để xem template đầy đủ cho cả v5 và v6.

---

## Vitest 1.x vs 2.x — Thay đổi ảnh hưởng React testing

| | Vitest 1.x | Vitest 2.x |
|---|---|---|
| Default pool | `forks` | `forks` (không đổi) |
| `globals: true` | ✅ | ✅ |
| Type hinting globals | `vitest/globals` | `vitest/globals` |
| `vi.useFakeTimers` | Cơ bản | + `advanceTimersByTimeAsync()` |
| Browser mode | Experimental | Stable (không dùng cho unit test thông thường) |

Không có breaking change đáng kể giữa Vitest 1 và 2 cho React unit testing với JSDOM.

---

## Config nâng cao

### Path alias (nếu project dùng `@/` alias)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### Coverage

```ts
// vite.config.ts
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov', 'html'],
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
  },
},
```

```bash
pnpm add -D @vitest/coverage-v8
pnpm test:coverage
```
