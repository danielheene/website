import { extractErrorMessage } from '@website/lib/extractErrorMessage'

/**
 * Placeholder-image sources to try in order:
 *
 * 1. `picsum.photos` seeded — real photos, deterministic per seed. Has
 *    returned intermittent 503s in CI.
 * 2. `picsum.photos` unseeded — same service and real photos, but without
 *    the `/seed/<seed>/` path, in case that specific route (rather than the
 *    service as a whole) is what's flaking.
 * 3. `placehold.co` — a trivial solid-color generator, not a real photo but
 *    a different provider entirely; last resort so a seed run never fails
 *    outright on two correlated picsum.photos outages.
 */
const SOURCES = [
  (seed: string) => `https://picsum.photos/seed/${seed}/1600/900`,
  () => 'https://picsum.photos/1600/900',
  () => 'https://placehold.co/1600x900.jpg',
]

/**
 * Downloads a placeholder image, trying each source in turn until one
 * succeeds. Throws the last source's error if all of them fail.
 */
export const fetchSeedImage = async (seed: string): Promise<Buffer> => {
  let lastErrorMessage: string | undefined

  for (const buildUrl of SOURCES) {
    try {
      const response = await fetch(buildUrl(seed))

      if (response.ok) return Buffer.from(await response.arrayBuffer())

      lastErrorMessage = `Failed to download placeholder image: HTTP ${response.status}`
    } catch (error) {
      lastErrorMessage = extractErrorMessage(error)
    }
  }

  throw new Error(lastErrorMessage ?? 'Failed to download placeholder image: no sources configured')
}
