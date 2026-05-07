# Utility Test — React Vitest (plain React / Vite)

Templates cho testing pure functions và helpers.
Nội dung tương đồng với `nextjs-vitest` — không có sự khác biệt lớn vì utility functions không phụ thuộc framework.

---

## Khi nào dùng `node` vs `jsdom` environment

```ts
// @vitest-environment node  ← file này không cần DOM, chạy nhanh hơn
// @vitest-environment jsdom ← file này cần DOM API (vd: test canvas, localStorage)
```

Global default trong `vite.config.ts`:
```ts
test: {
  environment: 'jsdom',  // mặc định cho component test
}
```

Đối với utility functions không cần DOM — thêm `// @vitest-environment node` ở đầu file để tối ưu tốc độ.

---

## Template 1: Pure function — format / validate

```ts
// src/utils/currency.ts
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^\d.]/g, ''))
}
```

```ts
// src/utils/__tests__/currency.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { formatVND, parseCurrency } from '../currency'

describe('formatVND', () => {
  it('formats amount as Vietnamese Dong', () => {
    const result = formatVND(50000)
    expect(result).toMatch(/50\.000/) // contains 50.000
    expect(result).toMatch(/₫|VND/)
  })

  it('handles zero', () => {
    expect(formatVND(0)).toMatch(/0/)
  })
})

describe('parseCurrency', () => {
  it.each([
    ['50.000 ₫', 50000],
    ['1.500.000', 1500000],
    ['0', 0],
  ] as const)('parses "%s" as %d', (input, expected) => {
    expect(parseCurrency(input)).toBe(expected)
  })
})
```

---

## Template 2: Validation logic

```ts
// src/utils/validators.ts
export const validators = {
  required: (val: unknown) => !!val || 'Bắt buộc nhập',
  email: (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email không hợp lệ',
  minLength: (min: number) => (val: string) =>
    val.length >= min || `Tối thiểu ${min} ký tự`,
}
```

```ts
// src/utils/__tests__/validators.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { validators } from '../validators'

describe('validators.required', () => {
  it.each([
    ['hello', true],
    ['', false],
    [null, false],
    [undefined, false],
  ])('required(%s) → %s', (input, expected) => {
    const result = validators.required(input)
    if (expected) {
      expect(result).toBe(true)
    } else {
      expect(typeof result).toBe('string') // error message
    }
  })
})

describe('validators.email', () => {
  it('accepts valid email', () => {
    expect(validators.email('user@example.com')).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(validators.email('not-an-email')).toBe('Email không hợp lệ')
  })
})
```

---

## Template 3: Async utility với mock

```ts
// src/services/api.ts
export async function fetchUsers(): Promise<Array<{ id: number; name: string }>> {
  const res = await fetch('/api/users')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
```

```ts
// src/services/__tests__/api.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchUsers } from '../api'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchUsers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns users on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Alice' }],
    })

    const result = await fetchUsers()

    expect(result).toEqual([{ id: 1, name: 'Alice' }])
    expect(mockFetch).toHaveBeenCalledWith('/api/users')
  })

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })

    await expect(fetchUsers()).rejects.toThrow('HTTP 404')
  })
})
```

---

## Template 4: localStorage / sessionStorage

```ts
// src/utils/storage.ts
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch { return null }
  },
  set: (key: string, value: unknown): void => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string): void => localStorage.removeItem(key),
}
```

```ts
// src/utils/__tests__/storage.test.ts
// @vitest-environment jsdom  ← cần jsdom vì dùng localStorage
import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '../storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('stores and retrieves a value', () => {
    storage.set('user', { name: 'Alice' })
    expect(storage.get('user')).toEqual({ name: 'Alice' })
  })

  it('returns null for missing key', () => {
    expect(storage.get('missing')).toBeNull()
  })

  it('removes a key', () => {
    storage.set('token', 'abc123')
    storage.remove('token')
    expect(storage.get('token')).toBeNull()
  })
})
```

---

## Template 5: Fake timers

```ts
// src/utils/debounce.ts
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
```

```ts
// src/utils/__tests__/debounce.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../debounce'

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('delays execution by specified ms', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('cancels previous calls when invoked rapidly', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledOnce()
  })
})
```

---

## Quick reference — Vitest APIs hay dùng

```ts
// Spy + Mock
const spy = vi.spyOn(obj, 'method')
const mockFn = vi.fn().mockReturnValue('result')
const mockFn = vi.fn().mockResolvedValue({ ok: true })
const mockFn = vi.fn().mockRejectedValue(new Error('oops'))

// Module mock
vi.mock('../../lib/service')
vi.mock('axios')

// Fake timers
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.runAllTimers()
vi.useRealTimers() // luôn gọi trong afterEach

// Reset
vi.clearAllMocks()   // calls + return values
vi.resetAllMocks()   // + mock implementation
vi.restoreAllMocks() // restore vi.spyOn

// Assertions
expect(fn).toHaveBeenCalledOnce()
expect(fn).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
expect(fn).toHaveBeenCalledTimes(3)
expect(promise).resolves.toEqual({ data: 'ok' })
expect(promise).rejects.toThrow('error message')
```
