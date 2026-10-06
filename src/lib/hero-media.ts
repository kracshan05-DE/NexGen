import { existsSync } from "node:fs";
import path from "node:path";

/*
 * The hero uses two optional files from the /public folder:
 *
 *   public/hero-banner.jpg   still image (also what "reduce motion" visitors see)
 *   public/hero-loop.mp4     looping background video
 *
 * This checks whether they exist when the site is built. Drop the files in,
 * commit, and the next deploy picks them up. If a file is missing the hero
 * falls back to a built-in photo, so the page never shows a broken image.
 */
const inPublic = (file: string) => existsSync(path.join(process.cwd(), "public", file));

export const heroMedia = {
  poster: inPublic("hero-banner.jpg") ? "/hero-banner.jpg" : null,
  video: inPublic("hero-loop.mp4") ? "/hero-loop.mp4" : null,
} as const;
