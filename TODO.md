# TODO

## Backend
- [ ] Parse `x-forwarded-for` and use the first IP for rate limiting in `src/lib/rate-limit.ts`.
- [ ] Add rate limiting to community comment and like endpoints.
- [ ] Consider an `includeTags` flag for `GET /api/jobs` to avoid extra joins when tags are not needed.

## Frontend
- [ ] Add `AbortController` to `/api/jobs` fetch to prevent stale responses winning race conditions.

## Tests
- [ ] Add coverage for `GET /api/jobs` returning tags.
