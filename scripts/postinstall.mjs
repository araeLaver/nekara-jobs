/**
 * postinstall script
 * In local dev, @sparticuz/chromium (devDep) provides the binary.
 * On Vercel, @sparticuz/chromium-min downloads the binary at runtime
 * from a remote URL, so no postinstall work is needed there.
 *
 * This script is intentionally a no-op for now; it exists as a hook
 * point in case we later need to package the binary into public/.
 */

const isVercel = !!process.env.VERCEL;

if (isVercel) {
  console.log('[postinstall] Vercel detected — skipping Chromium packaging (runtime download).');
} else {
  console.log('[postinstall] Local environment — full puppeteer/chromium available via devDependencies.');
}
