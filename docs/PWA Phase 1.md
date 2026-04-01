# Started. I implemented the first solid PWA conversion pass on branch **featured/pwa** with focus on offline access and icon correctness.

What I changed
1. Service worker registration is now production-safe and web-only:
_layout.tsx

2. Web manifest was upgraded for installability and app identity:
- added id, start_url, scope, description, orientation
- kept icon references aligned
site.webmanifest

3. Service worker was upgraded from basic cache to practical offline strategy:
- precache core shell + key icon/manifest assets
- navigation requests use network-first with cached fallback
- static assets use stale-while-revalidate
- runtime cache cleanup on activate
service-worker.js

4. Added dedicated offline fallback page:
offline.html

Validation results
1. Lint status: success (exit code 0).
2. No editor errors reported in the updated files.

About your icon requirement (Android and iOS)
1. Your native icon config is already correctly wired to real image assets in:
app.json
2. This is the key part to avoid fallback letter icons.
3. Important: icon updates on Android/iOS require rebuild/reinstall of the app to appear on the device home screen.

Recommended offline scope (my advice)
1. Phase 1 (already started): app shell + previously visited pages/assets offline.
2. Phase 2: offline read-only catalog snapshot (products/categories cached JSON or local DB mirror).
3. Phase 3: offline cart + queued checkout intent sync when network returns.
4. Phase 4: background sync and smarter cache versioning for releases.

Best next step I recommend
1. Run a production web export/build and test install/offline behavior on real devices.
2. Then I can implement Phase 2 next: offline product catalog snapshot so users can browse products fully offline, not only previously visited routes.

If you want, I’ll proceed immediately with Phase 2 on this same branch.

Made changes.