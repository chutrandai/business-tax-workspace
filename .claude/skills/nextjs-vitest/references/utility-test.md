# Utility Test — Next.js Vitest

Templates cho testing pure functions, helper utilities, và các module không phụ thuộc React/DOM.

---

## Khi nào dùng Node environment?

Utility functions thường không cần DOM. Chạy với `environment: 'node'` để nhanh hơn:

```ts
// __tests__/lib/formatDate.test.ts
// @vitest-environment node  ← override environment cho file này

import { describe, it, expect } from 'vitest'
import { formatDate } from '../../lib/formatDate'
```

Hoặc cấu hình global trong `vitest.config.mts` nếu đa số test là utility:

```ts
// vitest.config.mts — cho project thiên về utility
export default defineConfig({
  test: {
    environment: 'node',  // mặc định node, override 'jsdom' per-file khi cần
  },
})
```

---

## Template 1: Utility function đơn giản

```ts
// lib/formatDate.ts
export function formatDate(date: Date, locale = 'vi-VN'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now()
}
```

```ts
// __tests__/lib/formatDate.test.ts
// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate, isExpired } from '../../lib/formatDate'

describe('formatDate', () => {
  it('formats date in Vietnamese locale', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    // kết quả phụ thuộc locale — kiểm tra pattern thay vì giá trị cứng
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/tháng/i)
  })
})

describe('isExpired', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for past date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-01'))

    expect(isExpired(new Date('2024-05-01'))).toBe(true)
  })

  it('returns false for future date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-01'))

    expect(isExpired(new Date('2025-01-01'))).toBe(false)
  })
})
```

---

## Template 2: Validation / Business Logic

```ts
// lib/validators.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('Ít nhất 8 ký tự')
  if (!/[A-Z]/.test(password)) errors.push('Cần ít nhất 1 chữ hoa')
  if (!/[0-9]/.test(password)) errors.push('Cần ít nhất 1 chữ số')
  return { valid: errors.length === 0, errors }
}
```

```ts
// __tests__/lib/validators.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword } from '../../lib/validators'

describe('validateEmail', () => {
  it.each([
    ['user@example.com', true],
    ['alice@domain.co', true],
    ['invalid-email', false],
    ['@domain.com', false],
    ['user@', false],
    ['', false],
  ])('"%s" → valid: %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected)
  })
})

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const { valid, errors } = validatePassword('SecurePass1')
    expect(valid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('reports all errors for a weak password', () => {
    const { valid, errors } = validatePassword('weak')
    expect(valid).toBe(false)
    expect(errors).toContain('Ít nhất 8 ký tự')
    expect(errors).toContain('Cần ít nhất 1 chữ hoa')
    expect(errors).toContain('Cần ít nhất 1 chữ số')
  })
})
```

---

## Template 3: Utils có external dependency (mock module)

```ts
// lib/logger.ts
import pino from 'pino'
const logger = pino({ level: 'info' })
export default logger

// lib/notifier.ts
import logger from './logger'

export function notifyUser(userId: string, message: string): void {
  logger.info({ userId }, message)
  // gọi external service...
}
```

```ts
// __tests__/lib/notifier.test.ts
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

// Mock logger để không có output thật khi test
vi.mock('../../lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

import logger from '../../lib/logger'
import { notifyUser } from '../../lib/notifier'

describe('notifyUser', () => {
  it('logs with correct userId and message', () => {
    notifyUser('user-123', 'Welcome!')

    expect(logger.info).toHaveBeenCalledWith(
      { userId: 'user-123' },
      'Welcome!'
    )
  })
})
```

---

## Template 4: Utils với fake timers

```ts
// lib/debounce.ts
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
```

```ts
// __tests__/lib/debounce.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../../lib/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('only calls once after multiple rapid calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
  })
})
```

---

## Tóm tắt các Vitest utilities hữu ích

```ts
// Mock functions
const mockFn = vi.fn()
const mockFn = vi.fn().mockReturnValue('value')
const mockFn = vi.fn().mockResolvedValue({ data: 'ok' })
const mockFn = vi.fn().mockRejectedValue(new Error('fail'))

// Spy on method
const spy = vi.spyOn(object, 'method')
spy.mockReturnValue('mocked')

// Fake timers
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.runAllTimers()
vi.useRealTimers()

// Assertions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledOnce()
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledTimes(3)

// Reset
vi.clearAllMocks()    // reset calls/return values
vi.resetAllMocks()    // + reset mock implementation
vi.restoreAllMocks()  // restore original implementation (spies)
```
