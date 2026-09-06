const STREAM_API_URL = process.env.STREAM_API_URL ?? 'https://shustream.zeabur.app'

type FetchInit = NonNullable<Parameters<typeof fetch>[1]>

export async function streamApi(path: string, init?: FetchInit) {
  return fetch(`${STREAM_API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...init?.headers,
      'x-api-key': process.env.STREAM_API_ADMIN_KEY ?? '',
    },
  })
}
