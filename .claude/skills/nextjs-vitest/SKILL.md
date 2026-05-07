---
name: nextjs-vitest
description: Write comprehensive unit and integration tests for Next.js applications using Vitest and React Testing Library. Use this skill whenever the user asks to write tests, unit tests, add test coverage, test a component, test an API route, test a custom hook, mock dependencies, or validate Next.js behavior with Vitest. Triggers on "viết test nextjs", "vitest nextjs", "unit test react component", "test api route", "test server component", "test custom hook", "mock next/navigation", "mock next/router", "renderHook", "userEvent", "screen.getBy", "@testing-library/react", or any request involving verifying Next.js / React component behavior with Vitest.
---

# Next.js Vitest Skill

> **Skill này dành riêng cho Next.js.** Nếu project là plain React (Vite / CRA, không có Next.js), hãy dùng skill `reactjs-vitest` tại `.agents/skills/reactjs-vitest/`.
>
> **Điểm khác biệt chính so với reactjs-vitest:** cần mock `next/navigation`, `next/router`, `next/image`; hỗ trợ App Router Route Handlers; có Server Components (sync); dùng `vitest.config.mts` riêng.

Viết unit test và integration test chất lượng cao cho Next.js — hỗ trợ App Router (Next.js 13+) và Pages Router, tự detect version từ `package.json` và áp dụng đúng pattern.

## Quy trình làm việc

1. **Đọc `package.json`** — detect Next.js version & Vitest version hiện có
2. **Xác định compatibility profile** — tra bảng version matrix bên dưới
3. **Kiểm tra cấu hình** — đảm bảo `vitest.config.*` tồn tại và đúng
4. **Phân tích component/module cần test** — đọc source, xác định loại (Client / Server / Hook / API)
5. **Chọn chiến lược test** — xem bảng loại test
6. **Viết test** — theo template trong `references/`
7. **Chạy test và xác nhận pass**

---

## Bước 1: Detect Next.js & Vitest Version

**Luôn đọc `package.json` trước tiên.** Tìm các khóa sau:

```json
{
  "dependencies": {
    "next": "15.2.0",    // ← Next.js version
    "react": "19.0.0"    // ← React version
  },
  "devDependencies": {
    "vitest": "2.1.8",   // ← Vitest version (nếu đã có)
    "@testing-library/react": "16.2.0"
  }
}
```

Sau khi có version, tra bảng dưới và đọc `references/version-matrix.md` để biết chi tiết.

---

## Bảng Version Matrix — Nhanh

| Next.js | React | Vitest tương thích | RTL | Router | Ghi chú |
|---|---|---|---|---|---|
| **13.0 – 13.3** | 18.x | Vitest 0.28 – 0.34 | RTL 14.x | App Router (beta) | App Router còn thực nghiệm |
| **13.4 – 13.5** | 18.x | Vitest 0.34 – 1.0 | RTL 14.x | App Router (stable) | Stable App Router |
| **14.x** | 18.x | **Vitest 1.x – 2.x** | RTL 14.x – 15.x | App Router mặc định | Được khuyên dùng |
| **15.x** | **18.x hoặc 19.x** | **Vitest 2.x** | RTL **16.x** (React 19) hoặc 14-15.x (React 18) | App Router | React 19 yêu cầu RTL 16+ |

> **Điểm khác biệt quan trọng nhất:**
> - **Next.js 15 + React 19**: Dùng `@testing-library/react` 16.x — RTL 16 hỗ trợ React 19 concurrent features
> - **Async Server Components**: Vitest **không thể test** `async` Server Components trực tiếp — dùng E2E (Playwright/Cypress) cho loại này
> - **Vitest 2.x** thay đổi API browser mode — không ảnh hưởng JSDOM setup thông thường
>
> Đọc `references/version-matrix.md` để so sánh chi tiết từng version.

---

## Bước 2: Cài đặt & Cấu hình (nếu chưa có)

### TypeScript — Next.js 14 / 15 với React 18

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/dom \
  @testing-library/user-event @testing-library/jest-dom \
  vite-tsconfig-paths
```

### TypeScript — Next.js 15 với React 19

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react@^16 @testing-library/dom@^10 \
  @testing-library/user-event@^14 @testing-library/jest-dom \
  vite-tsconfig-paths
```

### `vitest.config.mts` (App Router — chuẩn)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,           // cho phép describe/it/expect không cần import
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

### `vitest.setup.ts`

```ts
import '@testing-library/jest-dom'
```

### `package.json` — thêm script

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

> **Nguyên tắc vàng**: Không install `jest`, `babel-jest`, hay `ts-jest` — Vitest tự xử lý TypeScript và JSX thông qua Vite. Không thêm `@testing-library/react` riêng lẻ nếu đang dùng `next/jest` — hai config này không dùng chung.

---

## Chiến lược chọn loại test

| Loại cần test | Approach | File tham chiếu |
|---|---|---|
| Client Component (`'use client'`) | `render()` + `screen` + `userEvent` | `references/component-test.md` |
| Synchronous Server Component | `render()` thông thường (không cần gì đặc biệt) | `references/component-test.md` |
| Async Server Component (`async function`) | ❌ Không dùng Vitest — dùng E2E | — |
| Custom Hook | `renderHook()` | `references/hooks-test.md` |
| API Route Handler (App Router) | Test function trực tiếp + mock `NextRequest` | `references/api-route-test.md` |
| API Route (Pages Router) | Mock `req`/`res` với `node-mocks-http` | `references/api-route-test.md` |
| Utility / Pure function | Vitest thuần (không cần DOM) | `references/utility-test.md` |

---

## Mock các Next.js module phổ biến

Một số module của Next.js cần mock trong môi trường test (JSDOM):

```ts
// next/navigation (App Router)
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// next/router (Pages Router)
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({ pathname: '/', push: vi.fn() })),
}))

// next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

// next/link — không cần mock, hoạt động bình thường với jsdom
```

---

## Bước 4: Đọc reference template phù hợp

Dựa vào loại cần test, đọc file tương ứng:

- **Client/Server Component** → `references/component-test.md`
- **Custom Hook** → `references/hooks-test.md`
- **API Route / Route Handler** → `references/api-route-test.md`
- **Chi tiết version compatibility** → `references/version-matrix.md`
- **Mục lục** → `references/README.md`

---

## Các lỗi phổ biến và cách xử lý

### 1. `TypeError: Cannot read properties of null` — thiếu mock next/navigation
```ts
// Thêm vào đầu test file hoặc setupFiles
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}))
```

### 2. `Error: invariant expected app router` — cần NextIntlClientProvider hoặc wrapper
```ts
// Hàm helper render có context
function renderWithProviders(ui: React.ReactElement) {
  return render(<TestProviders>{ui}</TestProviders>)
}
```

### 3. Async Server Component không test được
Vitest (JSDOM) không hỗ trợ `async` Server Component vì chúng phụ thuộc vào React Server runtime. Giải pháp:
- Tách logic ra custom hook hoặc utility function → test riêng
- Dùng Playwright/Cypress cho E2E test toàn flow

### 4. `SyntaxError: Cannot use import statement` — thiếu transform
Đảm bảo `vitest.config.mts` dùng plugin `react()` từ `@vitejs/plugin-react`. Không cần babel config riêng.

### 5. RTL `act()` warning với React 18/19
```ts
// Dùng userEvent.setup() thay vì fireEvent
const user = userEvent.setup()
await user.click(button)
```

### 6. `fetch is not defined` trong test Node environment
```ts
// vitest.setup.ts — nếu dùng environment: 'node'
import { vi } from 'vitest'
global.fetch = vi.fn()
```

### 7. Version conflict: RTL 15 với React 19
React 19 yêu cầu `@testing-library/react` **16.x**:
```bash
# Kiểm tra peer dependency
pnpm why @testing-library/react
# Cập nhật nếu cần
pnpm add -D @testing-library/react@^16
```

---

## Chạy test

```bash
# Watch mode (mặc định)
pnpm test

# Chạy 1 lần (CI)
pnpm test:run

# Chạy test cụ thể
pnpm vitest run src/components/Button.test.tsx

# Coverage
pnpm vitest run --coverage

# UI mode (visual)
pnpm vitest --ui
```

---

## Checklist trước khi hoàn thành

- [ ] Đọc `package.json` và xác định đúng Next.js / React / Vitest version
- [ ] `vitest.config.mts` tồn tại với `environment: 'jsdom'` và `@vitejs/plugin-react`
- [ ] `vitest.setup.ts` import `@testing-library/jest-dom`
- [ ] Đã mock các Next.js modules cần thiết (`next/navigation`, `next/router`, `next/image`)
- [ ] Không test `async` Server Component trực tiếp trong Vitest
- [ ] RTL version phù hợp với React version (RTL 16+ cho React 19)
- [ ] Test chạy được: `pnpm test:run` pass
- [ ] Mỗi test có Arrange → Act → Assert rõ ràng
