# CLAUDE.md

Behavioral guidelines and architecture notes for `claude-learn-mocks`.

## What this is

A small in-memory Express + TypeScript API that serves as the **real backend** for the `react-rtk-app` candidate/job-tracker FE (a sibling repo, typically checked out at `../react-rtk-app`). Runs on port 8080; `react-rtk-app/apps/web/vite.config.ts` proxies `/api` to `http://localhost:8080` for `pnpm run dev` (not `dev:mock`, which uses the FE's own MSW handlers instead of this server).

There's no database — every domain's "table" is a plain in-memory array in `src/data/*.ts`, seeded once at module load and mutated directly by controllers. Restarting the server resets all state.

**Keeping the FE in sync:** the FE's `apps/web/src/mocks/handlers.ts` (MSW) independently re-implements this API's behavior for `dev:mock` and integration tests. When you change a route's contract here (new endpoint, new validation rule, new field), the FE's mock handlers need the equivalent change too, or `dev:mock`/tests will silently drift from what `dev` actually does — see the FE's own CLAUDE.md section 11.

## Repo layout

```
src/
  index.ts              # Express app setup — mounts every domain's router
  routes/<domain>.routes.ts       # URL -> controller function mapping only
  controllers/<domain>.controller.ts  # request handling, validation, response shaping
  data/<domain>.ts                # in-memory array + the domain's TS interface
  utils/http.ts          # small helpers shared across controllers
```

Three-layer split per domain, no exceptions: routes never contain logic, controllers never define the data shape (that's `data/`), and `data/` files never import Express types.

## Conventions

**Nested resources** (a sub-collection under `:id`, e.g. `/api/candidates/:id/notes`, `/api/candidates/:id/status-history`) get their own `routes/<sub>.routes.ts` using `Router({ mergeParams: true })`, mounted directly on the parent path in `index.ts`: `app.use('/api/candidates/:id/notes', noteRoutes)`. `mergeParams` is required — without it the sub-router can't see the parent's `:id`.

**Resolving + validating an id param**: use `parseIdParam(raw, res, label)` from `utils/http.ts` for the base numeric-parse-and-400 step. When the id also needs to resolve to a real record (e.g. a nested resource under a candidate that must exist), each controller defines its own small `resolveCandidateId(req, res)` helper that calls `parseIdParam` then checks existence and sends 404 — see `note.controller.ts` and `statusHistory.controller.ts`. This helper is deliberately **duplicated per controller file**, not shared beyond `parseIdParam` itself; keep doing that rather than introducing a shared abstraction for two near-identical five-line functions.

**Query param arrays are comma-separated, not bracket-style.** Express 5's default "simple" query parser (Node's `querystring`) doesn't parse `status[]=a&status[]=b` into an array, so any endpoint accepting a multi-value filter (see `getCandidates`'s `status` param) must accept `status=a,b` and `.split(',')` it manually. This is a FE+BE contract — `apps/web/src/api/candidatesApi.ts` sends it this way on purpose.

**Bulk operations return a per-id result, not a single pass/fail.** See `bulkUpdateCandidateStatus`: partial failure (one stale id in a selection) is expected, so the response is `{ results: [{ id, success, ... }] }`, letting the caller show which ids failed. Follow this shape for any future bulk endpoint.

**IDs are `array.length + 1`.** Simple and fine because nothing is ever deleted; don't add delete endpoints without reconsidering this (it would produce duplicate ids after a delete+recreate).

**Status is validated, not state-machine-constrained, on the BE.** `updateCandidateStatus`/`bulkUpdateCandidateStatus` accept any value in `VALID_STATUSES` — they don't enforce that transitions follow a sensible order (e.g. `hired` → `applied` is allowed here). The FE's `CandidateStatusControl` is what limits the UI to sensible next stages; don't add transition-graph validation here unless a real product reason emerges, since the FE and BE would then need to agree on the graph twice.

**Single source of truth for enums**: `VALID_STATUSES` (`data/candidates.ts`) is the one place candidate status values are listed; controllers derive both the `CandidateStatus` type and runtime validation (`isValidStatus`) from it rather than re-declaring the list. Mirror this for any new enum-like domain value.

**Side effects that span two "tables"**: when an action on one domain array needs to also record something in another (e.g. `updateCandidateStatus`/`bulkUpdateCandidateStatus` appending to `data/statusHistory.ts`'s array), extract a small helper (`recordStatusChange`) rather than inlining the second array's mutation at every call site — see `candidate.controller.ts`.

## Quality gates

No lint or test framework is configured (`npm test` is a stub that exits nonzero — say so rather than skipping silently if asked to run tests). The only gate is `npx tsc --noEmit` (or `npm run build`, which also emits to `dist/`). Run it after any change.

## Running it

`npm run dev` (nodemon + ts-node, watches `src/`, port 8080). `GET /health` returns `{ status: 'ok' }` for a quick liveness check.
