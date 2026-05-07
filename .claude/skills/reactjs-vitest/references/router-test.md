# Router Test — React Vitest (react-router-dom)

Templates cho testing components có routing với `react-router-dom`.
**Không áp dụng cho Next.js** — Next.js dùng `next/navigation` và `next/router` (xem skill `nextjs-vitest`).

---

## So sánh nhanh: react-router v5 vs v6

| | v5 | v6 |
|---|---|---|
| Wrap test | `<MemoryRouter>` | `<MemoryRouter>` hoặc `RouterProvider` |
| Navigate hook | `useHistory()` | `useNavigate()` |
| Route match hook | `useRouteMatch()` | `useMatch()` |
| Params hook | `useParams()` | `useParams()` (giống) |
| Location hook | `useLocation()` | `useLocation()` (giống) |
| Redirect component | `<Redirect>` | `<Navigate>` |

---

## Template A: react-router-dom v6 — MemoryRouter wrapper (simple)

Cách đơn giản nhất — wrap component trong `MemoryRouter`:

```tsx
// src/components/NavBar.tsx
import { Link, useLocation } from 'react-router-dom'

export function NavBar() {
  const { pathname } = useLocation()
  return (
    <nav>
      <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
      <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
    </nav>
  )
}
```

```tsx
// src/components/__tests__/NavBar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NavBar } from '../NavBar'

describe('NavBar', () => {
  it('marks Home as active at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar />
      </MemoryRouter>
    )
    expect(screen.getByText('Home').closest('a')).toHaveClass('active')
    expect(screen.getByText('About').closest('a')).not.toHaveClass('active')
  })

  it('marks About as active at /about', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <NavBar />
      </MemoryRouter>
    )
    expect(screen.getByText('About').closest('a')).toHaveClass('active')
  })
})
```

---

## Template B: react-router-dom v6 — test useNavigate

```tsx
// src/components/GoBackButton.tsx
import { useNavigate } from 'react-router-dom'

export function GoBackButton() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>Go Back</button>
}
```

```tsx
// src/components/__tests__/GoBackButton.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { GoBackButton } from '../GoBackButton'

// Approach 1: Dùng MemoryRouter thật — navigate(-1) sẽ không làm gì nếu không có history
// Approach 2: Mock useNavigate để capture calls

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,                           // giữ nguyên tất cả export thật
    useNavigate: () => mockNavigate,     // override chỉ useNavigate
  }
})

describe('GoBackButton', () => {
  it('calls navigate(-1) when clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <GoBackButton />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button'))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
```

> **Lưu ý quan trọng:** Khi mock `react-router-dom`, luôn dùng `vi.importActual` để giữ lại phần không mock (Link, MemoryRouter, v.v.), chỉ override những hook cần test.

---

## Template C: react-router-dom v6 — test với route params

```tsx
// src/pages/UserDetail.tsx
import { useParams } from 'react-router-dom'

export function UserDetail() {
  const { userId } = useParams<{ userId: string }>()
  return <h1>User ID: {userId}</h1>
}
```

```tsx
// src/pages/__tests__/UserDetail.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { UserDetail } from '../UserDetail'

describe('UserDetail', () => {
  it('renders userId from route params', () => {
    render(
      <MemoryRouter initialEntries={['/users/42']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading')).toHaveTextContent('User ID: 42')
  })
})
```

---

## Template D: react-router-dom v6 — createBrowserRouter + RouterProvider

Khi dùng `createBrowserRouter` (Data Router API — react-router-dom 6.4+):

```tsx
// Router lớn hơn — tạo helper render
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../router/routes'

// src/test/test-utils.tsx — thêm helper cho router
export function renderWithRouter(
  ui: React.ReactElement,
  { initialPath = '/' } = {}
) {
  const router = createBrowserRouter([
    {
      path: '*',
      element: ui,
    },
  ])
  window.history.pushState({}, '', initialPath)
  return render(<RouterProvider router={router} />)
}
```

```tsx
// __tests__/SomeComponent.test.tsx
import { renderWithRouter } from '../test/test-utils'

it('renders at /dashboard', () => {
  renderWithRouter(<Dashboard />, { initialPath: '/dashboard' })
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

---

## Template E: react-router-dom **v5** (legacy)

```tsx
// __tests__/NavBarV5.test.tsx — cho project vẫn dùng react-router-dom v5
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { NavBar } from '../NavBar'

describe('NavBar (v5)', () => {
  it('renders at /home path', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Route path="/home" component={NavBar} />
      </MemoryRouter>
    )
    // assertions...
  })
})

// Mock useHistory (v5)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useHistory: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      goBack: vi.fn(),
    }),
  }
})
```

---

## Lỗi phổ biến

### `useNavigate() may be used only in context of a <Router>`
Component đang dùng `useNavigate` nhưng không có Router wrapper trong test:
```tsx
// Sửa: luôn wrap trong MemoryRouter
render(<MemoryRouter><ComponentWithNavigation /></MemoryRouter>)
```

### Mock react-router-dom làm mất `Link`, `MemoryRouter`
Không spread `actual` khi mock:
```ts
// ❌ Sai — mất toàn bộ export khác
vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }))

// ✅ Đúng
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})
```
