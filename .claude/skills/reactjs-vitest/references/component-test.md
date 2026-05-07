# Component Test — React Vitest (plain React / Vite)

Templates cho testing React Components trong plain React apps.
Không có `next/navigation`, `next/image` hay Server Components — sử dụng patterns React thuần.

---

## Setup chuẩn — `renderWithProviders` helper

Tạo file `src/test/test-utils.tsx` dùng chung:

```tsx
// src/test/test-utils.tsx
import { render, type RenderOptions } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from '../context/ThemeContext'
// import thêm các Provider cần thiết...

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
```

---

## Template 1: Component đơn giản (không router, không context)

```tsx
// src/components/Button.tsx
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
}

export function Button({ label, variant = 'primary', disabled, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  )
}
```

```tsx
// src/components/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button label="Save" />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button label="Save" onClick={handleClick} />)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Save" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies secondary variant class', () => {
    render(<Button label="Cancel" variant="secondary" />)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')
  })
})
```

---

## Template 2: Component có Context

```tsx
// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
```

```tsx
// src/components/__tests__/ThemeToggle.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../../context/ThemeContext'
import { ThemeToggle } from '../ThemeToggle'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('ThemeToggle', () => {
  it('shows Light theme initially', () => {
    render(<ThemeToggle />, { wrapper })
    expect(screen.getByText(/light/i)).toBeInTheDocument()
  })

  it('switches to dark theme on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />, { wrapper })

    await user.click(screen.getByRole('button'))

    expect(screen.getByText(/dark/i)).toBeInTheDocument()
  })
})
```

---

## Template 3: Component có async data loading

```tsx
// src/components/__tests__/UserList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UserList } from '../UserList'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('UserList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // never resolves
    render(<UserList />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders users after fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    })

    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

---

## Template 4: Form component

```tsx
// src/components/__tests__/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  it('submits with correct values', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret123',
    })
  })

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })
})
```

---

## Queries theo thứ tự ưu tiên

```ts
// 1. Role (accessibility-first)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })

// 2. Label
screen.getByLabelText(/username/i)

// 3. Placeholder
screen.getByPlaceholderText(/enter email/i)

// 4. Text
screen.getByText(/click me/i)

// 5. TestId — chỉ khi không có cách nào trên phù hợp
screen.getByTestId('user-avatar')
```

> **Không dùng className, id, hay DOM structure** để query — những thứ này dễ thay đổi khi refactor.
