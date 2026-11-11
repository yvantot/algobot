# Deployment and research data

How Algobot is deployed to Cloudflare and how research data is collected. For playing and developing the game, see the [README](../README.md).

## Deploy to Cloudflare

The game frontend and the upload Worker are separate deployments.

### Test online without pushing

Open [the test game](https://algobot-test.jidalman-work.workers.dev). From a terminal in this repository, update it with:

```sh
npm run deploy:staging
```

This builds your current local files and deploys the test game and test upload Worker through Wrangler. No Git push is required. The test game uses `algobot-data-test` in R2, under `testing/`; production uses `algobot-data`. Test saves are separate because the game runs at a different address. The test URL is public; its browser tab says **Algobot TEST**.

To run locally with uploads to the same test storage:

```sh
npm run dev:staging
```

Use `http://localhost:5173`. The command refuses to use a different port because the test upload Worker only permits the listed origins. Plain `npm run dev` retains its existing configuration.

Test credentials are already configured on the setup computer in the ignored `.env.staging.local` and `cloudflare/test/.secrets.local` files. They are separate from production credentials. On another computer, restore these files securely and authenticate Wrangler before deploying. See [test environment setup](../cloudflare/test/README.md). `npm run deploy:staging:check` builds and checks packaging without deploying.

### Game frontend

The production branch is `main`. Configure these in the game project's **Build variables and secrets** before building:

| Variable | Value |
| --- | --- |
| `VITE_UPLOAD_URL` | `https://upload.algobot.fun` |
| `VITE_UPLOAD_TOKEN` | The upload Worker's `STUDY_TOKEN` value |

Set the Cloudflare build command to:

```sh
npm run build && npm run verify:upload-build
```

Keep the frontend deployment configured to publish `dist`. The verification command fails if the built JavaScript is missing the upload configuration. Vite embeds these variables at build time, so changing them requires a new build.

The deploy command is `npx wrangler deploy`. The committed root `wrangler.jsonc`
publishes the already-verified `dist` assets to `algobot-latest` and `algobot.fun`.
Keep that configuration: without it, Wrangler's automatic framework setup modifies
the package files and Vite config, then rebuilds after upload verification. That
produces research records marked as an uncommitted build.

Merge the intended changes into `main`, then check Cloudflare's build history and production deployment before sharing the updated game. A successful Git merge alone does not confirm that the new frontend is live.

### Upload Worker

From the repository root, using a Cloudflare account with access to the Worker and bucket:

```sh
npx wrangler deploy --config upload-worker/wrangler.toml
```

The Worker serves `upload.algobot.fun` and stores archives in the `algobot-data` R2 bucket. It requires the `STUDY_TOKEN` and `ADMIN_TOKEN` secrets. Keep existing values when redeploying; see the [upload setup guide](../upload-worker/README.md) for initial configuration, limits, and verification.

Storage keeps one gzip JSON file per participant per collection round (`round3/participant/data.json.gz`). Each arriving upload replaces that file directly; the Worker does not parse or compare datasets. This is research data storage. Continue still loads the farm saved in the current browser.

The browser upload token is public in the built JavaScript. `ADMIN_TOKEN` is for researcher downloads only and must never be placed in a `VITE_` variable.

## Research data uploads

With uploads configured, the game sends compressed research archives every minute, after challenge scores and rewards are saved, and when Finish opens or the player returns to the menu. Players can also download their data. Wait for upload confirmation or save the download before closing the game; browser closure does not guarantee that an upload finishes.

Researchers can retrieve a collection round with:

```sh
npm run pull-data -- round3
```

Configure the administrator credentials as described in the [upload guide](../upload-worker/README.md). Downloads go to the ignored `training/raw/round3` directory. Keep participant exports and credentials out of Git, preserve historical experiment outputs, and write new analyses to separate directories.

For study preparation and analysis, see the [collection protocol](DATA_COLLECTION_PROTOCOL.md), [collection checklist](COLLECTION_DAY_CHECKLIST.md), and [model workflow](MODEL_WORKFLOW.md). Check the recorded version and study conditions before reusing an earlier collection protocol.

## Collection dashboard

Open https://data.algobot.fun and sign in with `ADMIN_TOKEN` (the same key used by `pull-data`). The dashboard lists participant files, storage upload dates, sizes, and downloads. It refreshes every minute while visible. QA files are hidden by default; enable **Include QA tests** to see them. Upload dates confirm receipt, not challenge completion.

The Upload errors view queries Cloudflare logs through the Worker. Configure the server-only `OBSERVABILITY_TOKEN` secret with Workers Observability Write/Edit permission for the account. Log queries require that permission even though this dashboard only reads data. It never exposes the token or raw request headers. Missing permissions show an explicit error. Cloudflare retention limits apply; this is not a permanent error archive.

The administrator key is held in tab memory only. Sign out or reload to clear it. Never put either administrator secret in a `VITE_` variable.

Browser diagnostics report uncaught errors, rejected promises, failed resources, and explicit save/load, research persistence, challenge transaction, and upload failures. The separate `/errors` endpoint accepts at most 8 KiB and writes a structured Cloudflare log; it never reads or changes dataset storage. Reports include participant/session codes, build commit, occurrence time, a scrubbed message, and a bounded stack trace. They contain no dataset or student program. The browser suppresses identical errors for five minutes and accepts at most ten new reports per hour per tab. A twenty-report local outbox retries with backoff; when browser storage is unavailable it falls back to memory. Delivery is best-effort: offline exits, crashes, blocked requests, or quota limits can prevent it. Existing open games must reload to install the reporter.
