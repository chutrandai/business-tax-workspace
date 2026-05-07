---
name: reactjs-vitest
description: Write comprehensive unit and integration tests for plain React applications (Vite, CRA, or any non-Next.js React setup) using Vitest and React Testing Library. Use this skill whenever the user asks to write tests, unit tests, add test coverage, test a React component, test a custom hook, mock react-router-dom, mock dependencies, or validate React component behavior with Vitest — on a project that is NOT using Next.js. Triggers on "viết test react", "vitest react", "unit test react", "test component react", "test custom hook", "mock react-router", "renderHook", "userEvent", "screen.getBy", "@testing-library/react", "vite react test", or any request involving verifying React / Vite component behavior with Vitest outside of Next.js.
---

# React Vitest Skill

> **Skill này dành cho plain React apps (Vite, CRA).** Nếu project dùng Next.js, hãy dùng skill `nextjs-vitest` tại `.agents/skills/nextjs-vitest/`.
>
> **Điểm khác biệt chính so với nextjs-vitest:** dùng `react-router-dom` thay vì `next/navigation`; không có Server Components; config nằm trong `vite.config.ts` (không cần file riêng `vitest.config.mts`); không cần `vite-tsconfig-paths` trừ khi project cấu hình alias.

Viết unit test và integration test chất lượng cao cho React — hỗ trợ Vite và CRA (migrate), tự detect version từ `package.json` và áp dụng đúng pattern.

## Quy trình làm việc

1. **Đọc `package.json`** — detect React version, Vitest version, router library đang dùng
2. **Xác định compatibility profile** — tra bảng version matrix bên dưới
3. **Kiểm tra cấu hình** — đảm bảo `vite.config.ts` có `test` block hoặc `vitest.config.ts` tồn tại
4. **Phân tích component/module cần test** — đọc source, xác định loại (Component / Hook / Util)
5. **Chọn chiến lược test** — xem bảng loại test
6. **Viết test** — theo template trong `references/`
7. **Chạy test và xác nhận pass**

---

## Bước 1: Detect React & Vitest Version

**Luôn đọc `package.json` trước tiên.** Tìm các khóa sau:

```json
{
  "dependencies": {
    "react": "18.3.1",          // ← React version
    "react-router-dom": "6.27.0" // ← Router version (nếu có)
  },
  "devDependencies": {
    "vitest": "2.1.8",
    "@testing-library/react": "16.2.0",
    "vite": "5.4.11"
  }
}
```

Sau khi có version, tra bảng dưới và đọc `references/version-matrix.md` để biết chi tiết.

---

## Bảng Version Matrix — Nhanh

| React | Vite | Vitest | @testing-library/react | react-router-dom |
|---|---|---|---|---|
| **17.x** | 2.x – 3.x | 0.28 – 0.34 | 13.x | 5.x |
| **18.x** | 4.x – 5.x | **1.x – 2.x** | **14.x – 15.x** | **6.x** |
| **19.x** | **5.x – 6.x** | **2.x** | **16.x** | **6.x – 7.x** |

> **Điểm khác biệt quan trọng nhất:**
> - **React 19 → RTL 16+**: RTL 15 không tương thích hoàn toàn với React 19 — cần `@testing-library/react@^16`
> - **react-router-dom v6 vs v5**: API mock khác nhau — xem `references/router-test.md`
> - **Vite 6**: Breaking change nhỏ trong plugin API, nhưng không ảnh hưởng test setup thông thường
>
> Đọc `references/version-matrix.md` để so sánh chi tiết.

---

## Bước 2: Cài đặt & Cấu hình (nếu chưa có)

### Cài packages

```bash
# React 18 — recommended stable stack
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/dom \
  @testing-library/user-event @testing-library/jest-dom

# React 19 — cần RTL 16
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react@^16 @testing-library/dom@^10 \
  @testing-library/user-event@^14 @testing-library/jest-dom
```

### Cách 1: Tích hợp vào `vite.config.ts` (khuyên dùng — một file duy nhất)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ↓ Thêm block này để enable Vitest
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

> Cần thêm `/// <reference types="vitest" />` ở đầu file nếu TypeScript báo lỗi `test` không tồn tại:
> ```ts
> /// <reference types="vitest" />
> import { defineConfig } from 'vite'
> ```

### Cách 2: File `vitest.config.ts` riêng (khi config vite và vitest cần tách biệt)

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

### `package.json` — scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

> **Khác biệt với Next.js:** Trong plain React/Vite, config test thường **tích hợp vào `vite.config.ts`** luôn — không cần `vite-tsconfig-paths` (trừ khi dùng path aliases) và không cần file `vitest.config.mts` riêng.

---

## Chiến lược chọn loại test

| Loại cần test | Approach | File tham chiếu |
|---|---|---|
| React Component (không router) | `render()` + `screen` + `userEvent` | `references/component-test.md` |
| Component có `react-router-dom` | Wrap trong `MemoryRouter` hoặc `RouterProvider` | `references/router-test.md` |
| Custom Hook | `renderHook()` | `references/hooks-test.md` |
| Utility / Pure function | Vitest thuần (environment: node) | `references/utility-test.md` |
| Context Provider | Wrapper function trong `render` | `references/component-test.md` |

---

## Mock các dependency phổ biến trong React

```ts
// react-router-dom v6 — mock useNavigate, useLocation, useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),  // trả về mock navigate function
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
    useParams: vi.fn(() => ({})),
  }
})

// Axios / fetch — mock HTTP calls
vi.mock('axios')
import axios from 'axios'
vi.mocked(axios.get).mockResolvedValue({ data: { id: 1, name: 'Alice' } })

// Module nội bộ
vi.mock('../services/userService', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
}))
```

> **So sánh với Next.js:** Trong plain React không có `next/navigation`, `next/router`, `next/image`, `next/headers` — không cần mock những module này. Router mock dùng `react-router-dom` hoặc wrapper thật sự.

---

## Bước 4: Đọc reference template phù hợp

- **Component** → `references/component-test.md`
- **Router (react-router-dom)** → `references/router-test.md`
- **Custom Hook** → `references/hooks-test.md`
- **Utility/Pure function** → `references/utility-test.md`
- **Version compatibility đầy đủ** → `references/version-matrix.md`
- **Mục lục** → `references/README.md`

---

## Các lỗi phổ biến và cách xử lý

### 1. `useNavigate() may be used only in the context of a <Router> component`
```tsx
// Bọc component trong MemoryRouter khi test
import { MemoryRouter } from 'react-router-dom'

render(
  <MemoryRouter initialEntries={['/home']}>
    <MyComponent />
  </MemoryRouter>
)
```

### 2. `SyntaxError: Cannot use import statement` — module không được transform
```ts
// vite.config.ts — thêm transformMode nếu cần
test: {
  environment: 'jsdom',
  // Đảm bảo plugin react() xử lý JSX
  // Nếu vẫn lỗi, kiểm tra lại plugins: [react()]
}
```

### 3. RTL act() warning với React 18
```ts
// Luôn dùng await + userEvent.setup() thay vì fireEvent
const user = userEvent.setup()
await user.click(button)
```

### 4. `fetch is not defined` (Vitest chạy trong Node)
```ts
// src/test/setup.ts
import { vi } from 'vitest'
global.fetch = vi.fn()
// Hoặc dùng msw (Mock Service Worker) cho mock HTTP chuyên nghiệp hơn
```

### 5. Environment mismatch — component cần DOM nhưng test chạy `node`
```ts
// Thêm annotation vào đầu file test
// @vitest-environment jsdom

// Hoặc đặt global trong vite.config.ts: environment: 'jsdom'
```

### 6. Version conflict RTL 15 + React 19
```bash
pnpm add -D @testing-library/react@^16
# Kiểm tra không còn peer dependency warning
pnpm why @testing-library/react
```

### 7. TypeScript không nhận globals (`describe`, `it`, `expect`)
```ts
// tsconfig.json — thêm types
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
// Hoặc import trực tiếp trong mỗi file test
import { describe, it, expect, vi } from 'vitest'
```

---

## Chạy test

```bash
# Watch mode
pnpm test

# Chạy 1 lần (CI)
pnpm test:run

# Chạy test cụ thể
pnpm vitest run src/components/Button.test.tsx

# Coverage
pnpm vitest run --coverage

# UI mode
pnpm vitest --ui
```

---

## Checklist trước khi hoàn thành

- [ ] Đọc `package.json` và xác định đúng React / Vitest / React Router version
- [ ] `vite.config.ts` (hoặc `vitest.config.ts`) có `test.environment: 'jsdom'`
- [ ] `src/test/setup.ts` import `@testing-library/jest-dom`
- [ ] Component có dùng router thì wrap trong `MemoryRouter` hoặc dùng `createBrowserRouter` test helper
- [ ] RTL version phù hợp với React version (RTL 16+ cho React 19)
- [ ] Test chạy được: `pnpm test:run` pass
- [ ] Mỗi test có Arrange → Act → Assert rõ ràng
- [ ] Không dùng `fireEvent` khi `userEvent` đủ dùng
