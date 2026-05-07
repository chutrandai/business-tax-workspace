# Hooks Test — React Vitest (plain React / Vite)

Templates cho testing custom React Hooks với `renderHook`.
Cùng API với `reactjs-vitest` và `nextjs-vitest` — `renderHook` export từ `@testing-library/react`.

---

## Template 1: Hook đơn giản

```ts
// src/hooks/useToggle.ts
import { useState, useCallback } from 'react'

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return { value, toggle, setTrue, setFalse }
}
```

```ts
// src/hooks/__tests__/useToggle.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '../useToggle'

describe('useToggle', () => {
  it('initializes to false by default', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('toggles value on each call', () => {
    const { result } = renderHook(() => useToggle())

    act(() => result.current.toggle())
    expect(result.current.value).toBe(true)

    act(() => result.current.toggle())
    expect(result.current.value).toBe(false)
  })

  it('sets value to true/false explicitly', () => {
    const { result } = renderHook(() => useToggle())

    act(() => result.current.setTrue())
    expect(result.current.value).toBe(true)

    act(() => result.current.setFalse())
    expect(result.current.value).toBe(false)
  })
})
```

---

## Template 2: Hook có react-router-dom dependency

```ts
// src/hooks/useQueryParam.ts
import { useLocation, useNavigate } from 'react-router-dom'

export function useQueryParam(key: string) {
  const { search } = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(search)

  const value = params.get(key)
  const setValue = (newValue: string) => {
    params.set(key, newValue)
    navigate({ search: params.toString() }, { replace: true })
  }

  return [value, setValue] as const
}
```

```tsx
// src/hooks/__tests__/useQueryParam.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useQueryParam } from '../useQueryParam'

// Wrapper cung cấp MemoryRouter cho hook
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/?tab=overview']}>
      {children}
    </MemoryRouter>
  )
}

describe('useQueryParam', () => {
  it('reads existing query param', () => {
    const { result } = renderHook(() => useQueryParam('tab'), { wrapper })
    expect(result.current[0]).toBe('overview')
  })

  it('returns null for non-existent param', () => {
    const { result } = renderHook(() => useQueryParam('missing'), { wrapper })
    expect(result.current[0]).toBeNull()
  })
})
```

---

## Template 3: Hook với Context

```tsx
// src/hooks/__tests__/useAuth.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthContext'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider initialUser={{ id: '1', name: 'Alice', role: 'admin' }}>
      {children}
    </AuthProvider>
  )

  it('returns current user from context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user?.name).toBe('Alice')
  })

  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      /must be used inside AuthProvider/i
    )
  })
})
```

---

## Template 4: Hook với async (fetch data)

```ts
// src/hooks/useFetch.ts
import { useState, useEffect } from 'react'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}
```

```ts
// src/hooks/__tests__/useFetch.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from '../useFetch'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useFetch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns data on successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ id: 1, name: 'Alice' }),
    })

    const { result } = renderHook(() => useFetch<{ id: number; name: string }>('/api/users/1'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ id: 1, name: 'Alice' })
    expect(result.current.error).toBeNull()
  })

  it('returns error on failed fetch', async () => {
    mockFetch.mockRejectedValueOnce(new Error('500 Internal Server Error'))

    const { result } = renderHook(() => useFetch('/api/broken'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('500 Internal Server Error')
    expect(result.current.data).toBeNull()
  })

  it('re-fetches when URL changes', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ name: 'Alice' }) })
      .mockResolvedValueOnce({ json: async () => ({ name: 'Bob' }) })

    const { result, rerender } = renderHook(
      ({ url }) => useFetch<{ name: string }>(url),
      { initialProps: { url: '/api/users/1' } }
    )

    await waitFor(() => expect(result.current.data?.name).toBe('Alice'))

    rerender({ url: '/api/users/2' })

    await waitFor(() => expect(result.current.data?.name).toBe('Bob'))
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
```

---

## Template 5: Hook với fake timers

```ts
// src/hooks/__tests__/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })
    expect(result.current).toBe('hello') // chưa update

    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('world') // đã update
  })
})
```

---

## Lưu ý `act()` và `waitFor`

```ts
// act() — cho state updates đồng bộ
act(() => result.current.someAction())

// waitFor — cho async state updates
await waitFor(() => expect(result.current.data).toBeDefined())

// KHÔNG dùng act() thủ công cho async — gây warning React
// waitFor tự xử lý async flush bên trong
```
