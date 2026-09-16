import NowPlaying from './nowPlaying'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function Index() {
  // useSearchParams needs a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <NowPlaying />
    </Suspense>
  )
}
