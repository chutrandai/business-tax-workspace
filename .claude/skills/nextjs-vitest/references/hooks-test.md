# Hooks Test — Next.js Vitest

Templates cho testing custom React Hooks với `renderHook`.

---

## Setup

`renderHook` được export từ `@testing-library/react` (RTL 13+). Không cần cài thêm gì.

```ts
import { renderHook, act } from '@testing-library/react'
```

---

## Template 1: Custom Hook đơn giản

```ts
// src/hooks/useCounter.ts
import { useState, useCallback } from 'react'

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  const reset = useCallback(() => setCount(initialValue), [initialValue])
  return { count, increment, decrement, reset }
}
```

```ts
// __tests__/hooks/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '../../src/hooks/useCounter'

describe('useCounter', () => {
  it('initializes with default value 0', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.decrement()
    })

    expect(result.current.count).toBe(4)
  })

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(3))

    act(() => {
      result.current.increment()
      result.current.increment()
      result.current.reset()
    })

    expect(result.current.count).toBe(3)
  })
})
```

---

## Template 2: Hook có Context dependency

```ts
// src/hooks/useAuth.ts
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

```tsx
// __tests__/hooks/useAuth.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AuthProvider } from '../../src/context/AuthContext'
import { useAuth } from '../../src/hooks/useAuth'

// Wrapper cung cấp Context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider initialUser={{ id: '1', name: 'Alice', role: 'admin' }}>
    {children}
  </AuthProvider>
)

describe('useAuth', () => {
  it('returns user from AuthContext', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user?.name).toBe('Alice')
  })

  it('throws error when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider'
    )
  })
})
```

---

## Template 3: Hook với async (data fetching)

```ts
// src/hooks/useFetchUser.ts
import { useState, useEffect } from 'react'

interface User { id: number; name: string }

export function useFetchUser(userId: number) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => { setUser(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [userId])

  return { user, loading, error }
}
```

```ts
// __tests__/hooks/useFetchUser.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFetchUser } from '../../src/hooks/useFetchUser'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useFetchUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user data on success', async () => {
    // Arrange — mock fetch
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ id: 1, name: 'Alice' }),
    })

    // Act
    const { result } = renderHook(() => useFetchUser(1))

    // Assert — initially loading
    expect(result.current.loading).toBe(true)

    // Wait for async update
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual({ id: 1, name: 'Alice' })
    expect(result.current.error).toBeNull()
  })

  it('returns error when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useFetchUser(99))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.user).toBeNull()
  })
})
```

---

## Template 4: Hook với `next/navigation`

```ts
// src/hooks/useActiveRoute.ts
'use client'
import { usePathname } from 'next/navigation'

export function useActiveRoute(targetPath: string) {
  const pathname = usePathname()
  return pathname === targetPath
}
```

```ts
// __tests__/hooks/useActiveRoute.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useActiveRoute } from '../../src/hooks/useActiveRoute'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

describe('useActiveRoute', () => {
  it('returns true when pathname matches target', () => {
    const { result } = renderHook(() => useActiveRoute('/dashboard'))
    expect(result.current).toBe(true)
  })

  it('returns false when pathname does not match', () => {
    const { result } = renderHook(() => useActiveRoute('/settings'))
    expect(result.current).toBe(false)
  })
})
```

---

## Lưu ý khi dùng `act()` với React 18/19

- Sử dụng `async act()` cho các thao tác async (state updates, promises)
- `userEvent` tự động wrap trong act — không cần gọi thủ công
- `waitFor` tự động poll cho đến khi assertion pass (timeout mặc định 1000ms)

```ts
// ✅ Đúng — dùng waitFor cho async state
await waitFor(() => expect(result.current.loading).toBe(false))

// ❌ Sai — act() thủ công cho async thường gây warning
act(() => { /* async code */ })
```
