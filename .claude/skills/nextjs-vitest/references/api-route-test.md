# API Route Test — Next.js Vitest

Templates cho testing API Routes (Pages Router) và Route Handlers (App Router).

---

## App Router — Route Handlers (`app/api/*/route.ts`)

Route Handlers là các hàm `GET`, `POST`,... thuần. Test chúng bằng cách tạo `NextRequest` mock và gọi trực tiếp.

### Template: GET Route Handler

```ts
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface User { id: string; name: string; email: string }

const db: Record<string, User> = {
  '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = db[params.id]
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  return NextResponse.json(user, { status: 200 })
}
```

```ts
// __tests__/api/users.test.ts
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../app/api/users/[id]/route'

// Helper: tạo NextRequest mock
function createRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), options)
}

describe('GET /api/users/[id]', () => {
  it('returns user when found', async () => {
    const req = createRequest('http://localhost/api/users/1')
    const response = await GET(req, { params: { id: '1' } })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
    })
  })

  it('returns 404 when user not found', async () => {
    const req = createRequest('http://localhost/api/users/999')
    const response = await GET(req, { params: { id: '999' } })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('User not found')
  })
})
```

---

### Template: POST Route Handler (với request body)

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 }
    )
  }

  const newUser = { id: Date.now().toString(), ...body }
  return NextResponse.json(newUser, { status: 201 })
}
```

```ts
// __tests__/api/create-user.test.ts
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/users/route'

function createPostRequest(url: string, body: unknown) {
  return new NextRequest(new URL(url, 'http://localhost'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/users', () => {
  it('creates user with valid data', async () => {
    const req = createPostRequest('http://localhost/api/users', {
      name: 'Bob',
      email: 'bob@example.com',
    })

    const response = await POST(req)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.name).toBe('Bob')
    expect(body.email).toBe('bob@example.com')
    expect(body.id).toBeDefined()
  })

  it('returns 400 when required fields are missing', async () => {
    const req = createPostRequest('http://localhost/api/users', { name: 'Bob' })

    const response = await POST(req)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Name and email are required')
  })
})
```

---

### Template: Route Handler với Authentication

```ts
// __tests__/api/protected-route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../app/api/protected/route'

// Mock auth module
vi.mock('../../lib/auth', () => ({
  getServerSession: vi.fn(),
}))

import { getServerSession } from '../../lib/auth'

describe('GET /api/protected', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost/api/protected')
    const response = await GET(req)

    expect(response.status).toBe(401)
  })

  it('returns data when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', name: 'Alice' },
    })

    const req = new NextRequest('http://localhost/api/protected')
    const response = await GET(req)

    expect(response.status).toBe(200)
  })
})
```

---

## Pages Router — API Routes (`pages/api/*.ts`)

Pages Router API Routes nhận `req: NextApiRequest` và `res: NextApiResponse`. Dùng `node-mocks-http` để tạo mock.

### Cài đặt `node-mocks-http`

```bash
pnpm add -D node-mocks-http
```

### Template: Pages API Route

```ts
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
  return res.status(200).json({ message: 'Hello World' })
}
```

```ts
// __tests__/api/hello.test.ts
import { describe, it, expect } from 'vitest'
import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/hello'

describe('GET /api/hello', () => {
  it('returns Hello World for GET request', async () => {
    const { req, res } = createMocks({ method: 'GET' })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({ message: 'Hello World' })
  })

  it('returns 405 for non-GET methods', async () => {
    const { req, res } = createMocks({ method: 'POST' })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(res._getJSONData()).toEqual({ error: 'Method POST Not Allowed' })
  })
})
```

### Template: Pages API Route với request body

```ts
// __tests__/api/login.test.ts
import { describe, it, expect } from 'vitest'
import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/auth/login'

describe('POST /api/auth/login', () => {
  it('returns token with valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        username: 'admin',
        password: 'secret',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = res._getJSONData()
    expect(data.token).toBeDefined()
  })

  it('returns 401 with invalid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'admin', password: 'wrong' },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })
})
```

---

## Mock Database / Prisma trong API Route test

Không kết nối DB thật trong unit test — mock client:

```ts
// __tests__/api/users-db.test.ts
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../app/api/users/route'

// Mock Prisma client
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { prisma } from '../../lib/prisma'

describe('GET /api/users (with DB)', () => {
  it('returns list of users', async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
    ])

    const req = new NextRequest('http://localhost/api/users')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Alice')
  })
})
```
