# github-up

[![NPM Version](https://img.shields.io/npm/v/github-up?logo=npm&labelColor=CB3837&color=black)](https://npm.im/github-up)
[![pkg.pr.new](https://pkg.pr.new/badge/kjanat/github-up)](https://pkg.pr.new/~/kjanat/github-up)

is github down (again) (maybe). booga check, you no doomscroll.

GitHub no work? maybe you. maybe GitHub. booga look two places same time:

- **www.githubstatus.com** - what GitHub admit to.
- **Downdetector** - what everyone else screaming about, usually first.

## or just watch the page

no install, no terminal. page poll itself, you stare:

[https://github-up.kjanat.dev/][site]

or pop it from the cli:

```bash
github-up web
# or
github-up site
```

## get booga

run direct, no install:

```bash
bunx github-up status
# or
npx -y github-up status
```

or keep forever:

```bash
bun install -g github-up
# or
npm install -g github-up
```

<details>
<summary>fresh builds (every commit)</summary>

every push + PR get published to [pkg.pr.new]. bot drop the url in the PR. run
any sha:

```bash
bunx https://pkg.pr.new/kjanat/github-up@<sha> status   # or npx / pnpx
```

</details>

## how use

### words for human

`status` give indicator, lil description, details from both place.

```bash
github-up status
```

### words for robot

json for scripts and little monitoring guys.

```bash
github-up status --json
```

### no words, just number

exit code always tell truth (see [the numbers](#the-numbers)), output or not.
slap `-q`/`--quiet` in CI when you only care about number.

```bash
github-up status -q
```

### pick your place

default check uses GitHub Status and Downdetector. use subcommand or `--source`;
`--source` eat commas and repeats. Downdetector may report unavailable if
Cloudflare challenge automated checks.

```bash
# subcommand
github-up github
github-up downdetector

# flag
github-up status --source github
github-up status -s downdetector

# many
github-up status --source github,downdetector
github-up status -s github -s downdetector
```

### pick your part

only care about one thing? every GitHub component got shorthand flag.
`--component` eat commas and repeats too, same as `--source`.

```bash
# is Actions cooked?
github-up status --actions

# many worry
github-up status --pr --pages
github-up github --component git,api
```

full set: `--actions`, `--api`, `--codespaces`, `--copilot`, `--git`,
`--issue`/`--issues`, `--packages`, `--pages`, `--pr`/`--prs`, `--webhooks`.

filter look at incident + component names, and severity come from what
actually matched: degraded = exit `1`, real outage = exit `2`, nothing
mention your thing = exit `0`. broad incident like "multiple GitHub services"
count for whatever you asked. downdetector no know components; its row pass
through whole.

## use in browser

browser-safe door, GitHub Status only (downdetector need real chromium, no work
in browser).

```typescript
import { checkGitHub } from "github-up/browser";

const result = await checkGitHub();

if (result.kind === "ok") {
  console.log(result.summary.status.description);
  console.log(result.summary.status.indicator);
  console.log(result.summary.incidents);
  console.log(result.summary.components);
} else {
  console.error(result.reason);
}
```

## the numbers

exit code = how bad. set every run (not just `--quiet`), worst source win.

|   Code | Vibe      | what happen                                             |
| -----: | :-------- | :------------------------------------------------------ |
|  **0** | all good  | everything work. go back to your life.                  |
|  **1** | meh       | minor thing, or GitHub got live incident.               |
|  **2** | cooked    | major/critical outage, or downdetector say GitHub down. |
| **21** | who knows | every source booga try was unreachable.                 |

source booga no reach = unknown, NOT down. `21` only when EVERY source dead, so
one flaky downdetector scrape no ruin your day.

## who do all this

booga no write flag parser. booga no write `--help`, tab-complete, json mode,
exit codes. all that [dreamcli]. booga just point at GitHub and shitpost.

you want make own CLI look this clean? -> [dreamcli]

## hack on it

```bash
bun install   # setup
bun run build # build
bun test      # test
```

## license

[MIT][LICENSE] © 2026 Kaj Kowalski

[LICENSE]: https://github.com/kjanat/github-up/blob/master/LICENSE
[dreamcli]: https://github.com/kjanat/dreamcli
[pkg.pr.new]: https://pkg.pr.new
[site]: https://github-up.kjanat.dev
