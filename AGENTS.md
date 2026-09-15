# AGENTS.md

Project-specific guidance for agents working in this repo. `CONTRIBUTING.md` is the human contributor guide; this file covers the toolchain and commands.

## Stack

- **Backend**: Go, entry point `cmd/taskboard`.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4 under `web/`. The built assets are copied into `cmd/taskboard/web/dist/` and embedded in the Go binary.

## Toolchain

`go` and `node` are **not on PATH** in non-interactive shells. This repo pins them via `mise.toml` (Go 1.26, Node 24), so prefix commands with `mise exec --`:

```sh
mise exec -- go build ./...
mise exec -- go test ./...
mise exec -- npm run build   # from web/
```

## Frontend lint + format: Oxc

`web/` uses the Oxc toolchain — `oxlint` (linter) and `oxfmt` (formatter). **Do not use ESLint or Prettier**; they are no longer dependencies.

- `web/.oxlintrc.json` — categories `correctness: error`, `suspicious: warn`; the `react` plugin (React Compiler + hooks rules) is enabled.
- `web/.oxfmtrc.json` — double quotes, semicolons, ES5 trailing commas, `printWidth` 80, `sortPackageJson` off.

Scripts (run from `web/`):

```sh
npm run lint        # oxlint
npm run lint:fix    # oxlint --fix
npm run fmt         # oxfmt (writes)
npm run fmt:check   # oxfmt --check (CI gate)
```

Run `npm run fmt` before committing. CI runs both `npm run lint` and `npm run fmt:check`.

Note: `web/` runs TypeScript 7 — the native compiler, still invoked as `tsc`. Dropping `typescript-eslint` removed the peer-dependency blocker that previously prevented the upgrade. TypeScript is only used via the `tsc` binary; no code imports its programmatic API, which is still unstable in 7.0.

## Common commands

```sh
make build          # frontend build + embed, then go build -o taskboard ./cmd/taskboard
make dev            # go run ./cmd/taskboard start --foreground
make dev-frontend   # cd web && npm run dev (Vite dev server, proxies API to :3010)
make test           # go test ./...
```

## Conventions

- Work in a working branch, never directly on `dev` or `main`. Branch off `dev` unless the change stacks on another feature branch.
- Conventional Commits, lowercase (e.g. `fix(web): ...`, `chore(ci): ...`).
- Branch names: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Go: `gofmt`. TypeScript/React: no `any`, follow existing patterns in `web/src/`.
