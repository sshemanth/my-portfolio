/**
 * Scroll timing for the hero sequence. Every number is a fraction (0–1) of the pinned
 * section's scroll progress, so the mapping is the same at any viewport size.
 */
export const heroConfig = {
  /** Pinned scroll distance in viewport heights. Longer = slower camera. */
  travel: { landscape: 2.6, portrait: 2.2 },
  /** Catch-up time in seconds for the single smoothing layer (GSAP scrub). 0 = none. */
  smoothing: 0.3,
  /** The camera move plays between these two points, easing in and out. */
  camera: { start: 0.02, end: 0.9, ease: "sine.inOut" },
  /** When each block of copy is on screen: [fade-in start, fully in, fade-out start, gone]. */
  beats: [
    { in: [0, 0], out: [0.15, 0.25] }, // 1 · who
    { in: [0.31, 0.41], out: [0.6, 0.69] }, // 2 · the work, as the camera closes in
    { in: [0.75, 0.86], out: null }, // 3 · the ask, on the settled frame
  ] as { in: [number, number]; out: [number, number] | null }[],
  /** Where keyboard focus scrolls to when it lands inside a beat that is off screen. */
  anchors: [0, 0.5, 0.96],
  /** Decoded frames kept in memory at once (each is width × height × 4 bytes). */
  decodedFrames: { landscape: 14, portrait: 12 },
  /** Parallel frame downloads. */
  concurrency: 6,
};
