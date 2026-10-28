import type { Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'

/**
 * The client's whole view of the API. One fetch helper, one error type, and
 * the session cookie travels with every call because both live on one origin.
 */

export type SocialProvider = 'google' | 'github'
export type ServerConfig = { socialProviders: SocialProvider[] }

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  const payload = await response.json().catch(() => null) as { error?: string } | null

  if (!response.ok) {
    throw new ApiError(payload?.error ?? 'The server could not complete that request.', response.status)
  }

  return payload as T
}

export const api = {
  config: () => request<ServerConfig>('/api/config'),

  catalog: () => request<{ resources: Resource[] }>('/api/catalog'),

  submitResource: (input: Pick<Resource, 'name' | 'url' | 'description' | 'category'>) =>
    request<{ resource: Resource }>('/api/catalog', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  moodboards: () => request<{ moodboards: LibraryMoodboard[] }>('/api/moodboards'),

  createMoodboard: (input: { name: string; color: string; description: string }) =>
    request<{ moodboard: LibraryMoodboard }>('/api/moodboards', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateMoodboard: (id: string, input: Partial<Pick<LibraryMoodboard, 'name' | 'color' | 'description'>>) =>
    request<{ moodboard: LibraryMoodboard }>(`/api/moodboards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deleteMoodboard: (id: string) =>
    request<{ id: string }>(`/api/moodboards/${id}`, { method: 'DELETE' }),

  setResourceState: (id: string, patch: { favorite?: boolean; moodboardId?: string | null }) =>
    request<{ resource: Resource }>(`/api/resources/${id}/state`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
}
