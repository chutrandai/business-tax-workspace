# Component Test — Next.js Vitest

Templates cho testing React Components (Client và Synchronous Server Components).

---

## Setup chuẩn — `renderWithProviders` helper

Tạo file `__tests__/test-utils.tsx` dùng chung cho toàn project:

```tsx
// __tests__/test-utils.tsx
import { render, type RenderOptions } from '@testing-library/react'
import React from 'react'

// Thêm các Provider cần thiết (ThemeProvider, SessionProvider, IntlProvider...)
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    // <SessionProvider session={null}>
    //   <ThemeProvider theme={lightTheme}>
        <>{children}</>
    //   </ThemeProvider>
    // </SessionProvider>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export tất cả từ RTL để test file chỉ cần import từ đây
export * from '@testing-library/react'
export { renderWithProviders as render }
```

---

## Template 1: Client Component (`'use client'`)

```tsx
// src/components/Button.tsx
'use client'
import { useState } from 'react'

interface ButtonProps {
  label: string
  onClick?: () => void
}

export default function Button({ label, onClick }: ButtonProps) {
  const [clicked, setClicked] = useState(false)
  return (
    <button
      onClick={() => { setClicked(true); onClick?.() }}
      data-testid="my-button"
      aria-label={label}
    >
      {clicked ? 'Clicked!' : label}
    </button>
  )
}
```

```tsx
// __tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../src/components/Button'

describe('Button', () => {
  it('renders with correct label', () => {
    // Arrange
    render(<Button label="Submit" />)

    // Assert
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('calls onClick and updates state when clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button label="Submit" onClick={handleClick} />)

    // Act
    await user.click(screen.getByRole('button'))

    // Assert
    expect(handleClick).toHaveBeenCalledOnce()
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

---

## Template 2: Component với `next/navigation`

```tsx
// src/components/NavButton.tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function NavButton() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <button onClick={() => router.push('/dashboard')}>
      Go to Dashboard (from {pathname})
    </button>
  )
}
```

```tsx
// __tests__/NavButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NavButton from '../src/components/NavButton'

// Mock next/navigation — PHẢI đặt ở top-level file
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  usePathname: vi.fn(() => '/home'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

describe('NavButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with current pathname', () => {
    render(<NavButton />)
    expect(screen.getByText(/from \/home/)).toBeInTheDocument()
  })

  it('navigates to /dashboard on click', async () => {
    const user = userEvent.setup()
    render(<NavButton />)

    await user.click(screen.getByRole('button'))

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})
```

---

## Template 3: Synchronous Server Component

Server Components không dùng state/effect, nên test như component thông thường:

```tsx
// src/components/UserCard.tsx
// Không có 'use client' → là Server Component
interface User {
  name: string
  email: string
}

export default function UserCard({ user }: { user: User }) {
  return (
    <div data-testid="user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

```tsx
// __tests__/UserCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserCard from '../src/components/UserCard'

describe('UserCard', () => {
  const mockUser = { name: 'Alice', email: 'alice@example.com' }

  it('renders user name and email', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })
})
```

> **Lưu ý**: Nếu Server Component là `async function`, bạn **không thể** render nó trong Vitest. Hãy tách data fetching ra khỏi component và test riêng hàm đó.

---

## Template 4: Component với Context / Provider

```tsx
// __tests__/ThemeToggle.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../src/context/ThemeContext'
import ThemeToggle from '../src/components/ThemeToggle'

describe('ThemeToggle', () => {
  it('toggles theme on click', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Light')
    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Dark')
  })
})
```

---

## Các query theo thứ tự ưu tiên (RTL Best Practice)

```ts
// 1. By Role — ưu tiên cao nhất (accessibility-first)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('textbox', { name: /email/i })

// 2. By Label Text
screen.getByLabelText(/username/i)

// 3. By Placeholder Text
screen.getByPlaceholderText(/enter email/i)

// 4. By Text
screen.getByText(/hello world/i)

// 5. By Test ID — chỉ dùng khi không có semantic query phù hợp
screen.getByTestId('user-card')
```
