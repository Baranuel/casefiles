/**
 * Local replacements for the images that used to be served from the
 * DigitalOcean Spaces CDN. Every asset now lives under `public/`, so the app
 * has no runtime dependency on an external image host.
 *
 * Portraits were re-encoded to 512px webp, so any legacy `.jpg`/`.jpeg`/`.png`
 * CDN URL persisted on a case needs its extension rewritten too — that is what
 * `toLocalImage` handles.
 */

const CDN_HOST_PATTERN = /^https?:\/\/casefiles\.[a-z0-9.]*digitaloceanspaces\.com\//i;

export const PORTRAITS: readonly string[] = [
  "/portraits/man_mid_1.webp",
  "/portraits/man_mid_2.webp",
  "/portraits/man_mid_3.webp",
  "/portraits/man_old_1.webp",
  "/portraits/man_old_2.webp",
  "/portraits/man_old_3.webp",
  "/portraits/man_old_4.webp",
  "/portraits/man_young_1.webp",
  "/portraits/man-old-1.webp",
  "/portraits/man-old-10.webp",
  "/portraits/man-old-2.webp",
  "/portraits/man-old-3.webp",
  "/portraits/man-old-8.webp",
  "/portraits/man-young-1.webp",
  "/portraits/man-young-10.webp",
  "/portraits/man-young-11.webp",
  "/portraits/man-young-12.webp",
  "/portraits/man-young-16.webp",
  "/portraits/man-young-17.webp",
  "/portraits/man-young-2.webp",
  "/portraits/man-young-3.webp",
  "/portraits/man-young-4.webp",
  "/portraits/man-young-5.webp",
  "/portraits/man-young-6.webp",
  "/portraits/man-young-7.webp",
  "/portraits/man-young-8.webp",
  "/portraits/woman_mid_1.webp",
  "/portraits/woman_mid_2.webp",
  "/portraits/woman_mid_3.webp",
  "/portraits/woman_mid_4.webp",
  "/portraits/woman_old_1.webp",
  "/portraits/woman_old_2.webp",
  "/portraits/woman_old_3.webp",
  "/portraits/woman_young_1.webp",
  "/portraits/woman_young_2.webp",
  "/portraits/woman_young_4.webp",
  "/portraits/woman_young_5.webp",
  "/portraits/woman_young_6.webp",
  "/portraits/woman-old-1.webp",
  "/portraits/woman-old-2.webp",
  "/portraits/woman-old-3.webp",
  "/portraits/woman-young-1.webp",
  "/portraits/woman-young-11.webp",
  "/portraits/woman-young-12.webp",
  "/portraits/woman-young-13.webp",
  "/portraits/woman-young-14.webp",
  "/portraits/woman-young-15.webp",
  "/portraits/woman-young-16.webp",
  "/portraits/woman-young-17.webp",
  "/portraits/woman-young-18.webp",
  "/portraits/woman-young-2.webp",
  "/portraits/women_young_3.webp",
] as const;

/**
 * Maps a stored image reference to its local equivalent. Accepts old absolute
 * CDN URLs as well as paths that are already local, and returns `null`
 * unchanged so callers can keep using their own fallback.
 */
export function toLocalImage<T extends string | null | undefined>(
  src: T
): T extends string ? string : T {
  if (!src) return src as never;

  const path = CDN_HOST_PATTERN.test(src)
    ? `/${src.replace(CDN_HOST_PATTERN, "")}`
    : src;

  // Only rewrite extensions for assets we converted to webp.
  if (/^\/(portraits|images)\//.test(path)) {
    return path.replace(/\.(jpe?g|png)$/i, ".webp") as never;
  }

  return path as never;
}
