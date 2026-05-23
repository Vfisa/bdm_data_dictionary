# Project Boilerplate — Keboola JavaScript Data App

This file is a starting prompt for Claude (or any AI assistant) when scaffolding a **new JavaScript Data App** for the Keboola Platform. It is **not** a Streamlit app. It is a Node.js / JavaScript application (typically Express + a JS frontend such as React/Vite, or pure Node) that runs inside Keboola's Data App container.

When invoked, Claude should generate a project that follows the conventions below. Before writing code, Claude must read the linked Keboola docs and confirm the choice of frontend framework, target Keboola stack region (`connection.eu-central-1.keboola.com`, `connection.keboola.com`, etc.), and the storage access strategy (Storage Access via Query Service, Input Mapping, plain Storage REST API, or some combination).

References (Claude must consult these before generating code):
- Apps overview (env var contract): https://help.keboola.com/data-apps/
- Data Apps — Python & JavaScript: https://help.keboola.com/data-apps/python-js/
- Storage Access from Data Apps: https://help.keboola.com/data-apps/storage-access/
- Query Service API (apiary): https://keboola.docs.apiary.io/

---

## 0. Pre-flight: Git Initialization Check

**Before generating any code, drafting a plan, or running any tool that modifies the working directory, Claude must verify the working directory is a git repository.**

This matters because everything downstream is a substantial change to the working tree. Without git, the user cannot review a diff, roll back a bad scaffolding decision, or push to a remote for deployment.

Procedure:

1. Check whether `.git/` exists in the project root.
2. **If yes:** Run `git status` and surface anything unexpected (uncommitted changes from prior work, untracked files). Confirm with the user that this repo is the right place to scaffold into. Note the current branch — the user will deploy from it later.
3. **If no:** Stop and ask the user: "I'd like to run `git init` and make a baseline commit before scaffolding so changes are tracked and reversible. OK to proceed?" Don't run `git init` silently — the user might intend to scaffold inside an existing parent repo or use a different VCS layout. Wait for confirmation.
4. Either way, surface to the user that **a remote git repository (GitHub, GitLab, or Bitbucket) is required for deployment** — Keboola Data Apps deploy by pulling from a git URL. The remote does not need to exist yet, but the user should plan to create one before Section 6.

---

## 1. Required Project File Structure

Keboola's JS Data App container expects a runnable Node app exposed on an internal port (default `3000`), fronted by an nginx proxy on port `8888`, and bootstrapped by a `setup.sh` script. The minimum file layout Claude must create:

```
<project-root>/
├── package.json                  # "type": "module", scripts: dev / build / start
├── package-lock.json
├── server/
│   └── index.js                  # Node entry point — must listen on process.env.PORT || 3000
├── src/                          # Frontend source (React/Vite/plain JS) — optional
│   └── main.{js,ts,tsx}
├── public/ or dist/              # Static build output served by Express
├── index.html                    # Vite/SPA entry (only if frontend is bundled)
├── keboola-config/               # REQUIRED — picked up by the Data App runtime
│   ├── setup.sh                  # Bootstrap: `npm install && npm run build`
│   ├── nginx/
│   │   └── sites/
│   │       └── default.conf      # listen 8888 → proxy_pass http://127.0.0.1:3000
│   └── supervisord/
│       └── services/
│           └── app.conf          # [program:app] command=node /app/server/index.js
├── .env.example                  # Committed — documents required vars, no secrets
├── .env.local                    # NEVER committed — local dev only
├── .gitignore                    # Must include .env, .env.local, *.local, node_modules, dist
└── README.md
```

### `keboola-config/setup.sh`
```bash
#!/bin/bash
set -Eeuo pipefail
cd /app && npm install && npm run build
```

### `keboola-config/nginx/sites/default.conf`
```nginx
server {
    listen 8888;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

For SSE/WebSocket streaming endpoints, add `proxy_buffering off;`, `proxy_http_version 1.1;`, `proxy_set_header Upgrade $http_upgrade;`, `proxy_set_header Connection "upgrade";`, and a longer `proxy_read_timeout` to the relevant `location` block.

### `keboola-config/supervisord/services/app.conf`
```ini
[program:app]
command=node /app/server/index.js
directory=/app
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

Use **absolute paths starting with `/app/`** in `app.conf`. Relative paths fail silently in the container.

### `package.json` baseline
```json
{
  "name": "<app-name>",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server/index.js"
  }
}
```

Claude must ensure the Node entry **reads `process.env.PORT` with a `3000` fallback**, listens on `0.0.0.0`, and serves the built static assets (when a frontend is present) so a single Express process satisfies both the SPA and API on port 3000.

### Critical: handle POST on `/`

**Keboola sends a POST to `/` when starting your container as a liveness probe. If only GET is registered on `/`, the probe returns "Method Not Allowed" and the app appears broken — even though it works locally.** This is one of the most common reasons a JS Data App fails to come up the first time.

The fix in Express:

```js
app.all('/', (req, res, next) => {
  if (req.method === 'POST') return res.status(200).json({ status: 'ok' });
  next(); // GET / falls through to static SPA / index handler
});
```

For an API-only app with no HTML at `/`: `app.all('/', (req, res) => res.json({ status: 'ok' }))`.

---

## 2. Visual Quality (for Dashboards, Reports, and KPI Viewers)

When the app is a dashboard, report, KPI viewer, scoreboard, monitoring view, executive summary, or anything similar, **make it look good from the first commit**. A "minimum viable" dashboard with default browser styles, jagged tables, and unstyled `<button>` elements is not the deliverable — most users want it polished but don't think to ask explicitly. Default to polish; ask before cutting it.

Specifically:

- **Use a real design system, not raw HTML.** Tailwind CSS is the default in this skill's recommended stack; combine it with shadcn/ui-style components (Badge, Button, Input, Card, Tooltip, Tabs) for cohesive look-and-feel. If the user already has a design language in mind (Material, Carbon, in-house tokens), follow that instead.
- **Charts should be chart-library quality.** Recharts, Chart.js, ECharts, or Plotly — pick one and use it consistently. Avoid hand-rolled `<svg>` charts unless explicitly asked. Set sensible defaults: axis labels, gridlines, value formatting (commas for thousands, percentages where appropriate, abbreviated units like `1.2M`).
- **Layout must breathe.** Generous whitespace, consistent spacing scale, clear visual hierarchy. Group related metrics into cards. Use a sticky or prominent header. Make the page usable on a 1280×800 laptop screen without horizontal scroll.
- **Data tables are not dumps.** Sortable columns, sticky headers when the table is tall, alignment by data type (right-align numbers, left-align text), zebra striping or hover states, and an empty state with copy that explains "no rows yet" rather than a blank box.
- **Color with intent.** Pick 2–3 accent colors and stick to them. Use semantic colors for status (red/amber/green) consistently. Support a light/dark mode toggle when the host project uses one. Don't introduce new accent colors per chart — use the same palette across all visualizations.
- **Loading and error states are part of the design.** Skeleton screens or spinners for async data, friendly error messages with a retry affordance. Never leave a dashboard in an indeterminate "blank screen" state on slow networks.
- **Typography matters.** Use a single sans-serif family (system stack or one webfont) with a clear type scale: small captions, body, section headings, prominent KPI numbers. Tabular numerals (`font-variant-numeric: tabular-nums`) for any column of numbers.

If the user wants the dashboard delivered fast and is fine with rough edges, ask before cutting visual quality. When in doubt, err toward polish.

---

## 3. Environment Variables and `.env.local`

Secrets are **only** consumed via `.env.local` locally. In production, Keboola injects platform env vars and any user-declared secrets directly into the container's process environment — the app must read them with `process.env.<NAME>` and never read or write any `.env*` file at runtime in production.

### Platform-injected env vars

These are exactly what the platform sets at runtime — use these names, not whatever the user happens to type. Source: https://help.keboola.com/data-apps/ plus runtime confirmation.

| Variable | When set | Purpose |
|---|---|---|
| `BRANCH_ID` | Always | Storage API branch ID of the project (`default` or numeric branch ID). |
| `KBC_URL` | Always | Storage / Connection URL (e.g. `https://connection.eu-central-1.keboola.com`). Confirmed injected at runtime even though not currently called out in the public Apps overview. |
| `KBC_TOKEN` | Always | Storage API token. |
| `SANDBOX_ID` | Always | Sandbox / runtime identifier of the Data App. |
| `DATA_LOADER_API_URL` | With Data Loader | Data Loader API URL. |

`BRANCH_ID`, `KBC_URL`, `KBC_TOKEN`, `SANDBOX_ID` are always-injected at runtime. That's the entire contract this skill cares about.

**`SANDBOX_ID` doubles as the workspace ID for Query Service calls.** The Query Service endpoint is `POST {queryServiceUrl}/api/v1/branches/{BRANCH_ID}/workspaces/{SANDBOX_ID}/queries` — `SANDBOX_ID` fills the `{workspaceId}` path parameter. There is **no separate `WORKSPACE_ID` env var, no `KBC_WORKSPACE_MANIFEST_PATH`, and no `QUERY_SERVICE_URL`** — see "Deriving the Query Service URL from `KBC_URL`" below.

### Regional Keboola endpoints

In production the platform sets `KBC_URL` to match the project's stack. For local development, fill `.env.local` with the connection URL for the stack the project lives on:

| Region | Stack | `KBC_URL` |
|---|---|---|
| AWS US East 1 (default) | `keboola.com` | `https://connection.keboola.com` |
| AWS EU Central 1 (Frankfurt) | `eu-central-1.keboola.com` | `https://connection.eu-central-1.keboola.com` |
| Azure EU North (Ireland) | `north-europe.azure.keboola.com` | `https://connection.north-europe.azure.keboola.com` |
| GCP EU West 3 (Frankfurt) | `europe-west3.gcp.keboola.com` | `https://connection.europe-west3.gcp.keboola.com` |
| GCP US East 4 (Virginia) | `us-east4.gcp.keboola.com` | `https://connection.us-east4.gcp.keboola.com` |
| Self-hosted / custom | `<custom-domain>` | `https://connection.<custom-domain>` |

### Deriving the Query Service URL from `KBC_URL`

Keboola hosts every stack on two parallel hostnames: `https://connection.<stack>` (Storage REST endpoint, exposed as `KBC_URL`) and `https://query.<stack>` (Query Service API). The `<stack>` suffix is identical, so the app computes the Query Service URL with a one-line substitution. This works for default regions, regional stacks, and self-hosted deployments — anywhere the connection host follows the `connection.<host>` convention.

```js
function deriveQueryServiceUrl(kbcUrl) {
  const u = (kbcUrl || '').replace(/\/+$/, '');
  if (!/^https?:\/\/connection\./.test(u)) {
    throw new Error(
      `Cannot derive Query Service URL from KBC_URL "${kbcUrl}". ` +
      'Expected the URL to start with https://connection.'
    );
  }
  return u.replace(/^(https?):\/\/connection\./, '$1://query.');
}

// Examples
//   https://connection.keboola.com               → https://query.keboola.com
//   https://connection.eu-central-1.keboola.com  → https://query.eu-central-1.keboola.com
//   https://connection.us-east4.gcp.keboola.com  → https://query.us-east4.gcp.keboola.com
//   https://connection.<custom-domain>           → https://query.<custom-domain>
```

Pass the derived URL as the base for Query Service requests. No extra env var, no per-region branching, no documentation drift when Keboola adds a new region.

### The workspace ID is `SANDBOX_ID`

The Query Service endpoint is `POST {queryServiceUrl}/api/v1/branches/{BRANCH_ID}/workspaces/{workspaceId}/queries`. For Data Apps, `{workspaceId}` is `process.env.SANDBOX_ID` — the app's sandbox doubles as the Query Service workspace. There is no separate `WORKSPACE_ID` variable, no manifest file to parse — just use `SANDBOX_ID`.

### Custom-secret naming convention in the Keboola UI

For variables the platform does **not** auto-inject (third-party API keys, webhook secrets, etc.), declare them in the Data App configuration's **Secrets** section. Each key takes a `#` prefix to mark the value encrypted at rest:

| Keboola UI key | What `process.env` sees |
|---|---|
| `#ANTHROPIC_API_KEY` | `ANTHROPIC_API_KEY` |
| `#MY_THIRD_PARTY_KEY` | `MY_THIRD_PARTY_KEY` |

The `#` is stripped on injection, dashes become underscores, and the name is uppercased. The README should list every required custom secret using its `#`-prefixed UI key.

### `.env.example` (committed)

The template should surface every platform-injected variable so the developer knows what the runtime provides. Claude scaffolds both `.env.example` (committed) and `.env.local` (gitignored, blank template — see the next section), then tells the developer to open `.env.local` and fill in the values for local testing.

```bash
# ─── Platform-injected env vars (auto-set in production) ────────────────
# All four below are set at runtime by Keboola — fill in for local testing.
BRANCH_ID=default
KBC_URL=https://connection.eu-central-1.keboola.com
KBC_TOKEN=
SANDBOX_ID=
# Note: SANDBOX_ID is ALSO the workspace ID used in Query Service calls.
# The Query Service URL is derived from KBC_URL at runtime (replace
# "connection." with "query."). Neither is a separate env var.

# ─── Set when Data Loader is used ───────────────────────────────────────
# DATA_LOADER_API_URL=

# ─── Custom secrets (add as #-prefixed in Data App config UI) ──────────
# Only needed for variables the platform does NOT auto-inject.
# ANTHROPIC_API_KEY=
```

### `.env.local` (developer's machine, **never committed**)

Claude should create `.env.local` **as a blank template** during scaffolding — copy `.env.example` to `.env.local` so the developer doesn't have to remember the variable names, but **never fill in any real values**.

After creating it, Claude must explicitly enumerate **every** variable the developer needs to fill in. Don't shorten the list to the one or two that come to mind first — the most common scaffold failure is the developer running `npm run dev` and getting cryptic errors because they filled in `KBC_TOKEN` but skipped `BRANCH_ID` or `KBC_URL`. The instruction Claude surfaces should look like:

> "I've created `.env.local` as a blank template. Before running locally, please fill in:
>
> - `BRANCH_ID` — usually `default`, or a numeric branch ID for a development branch
> - `KBC_URL` — Storage / Connection URL of your Keboola stack (e.g., `https://connection.eu-central-1.keboola.com`)
> - `KBC_TOKEN` — Storage API token (Keboola → Settings → API Tokens)
> - `SANDBOX_ID` — if the app uses the Query Service, this is also the workspace ID. Set it to the workspace ID of a sandbox you've provisioned for local testing; in production the platform sets it.
>
> Plus any third-party API keys the app needs (e.g., `ANTHROPIC_API_KEY`)."

Tailor that list to whatever the app actually reads — but never abbreviate it down to one variable.

This way the developer has a ready-to-fill file when they sit down to test, but no real token ever lives in Claude's output. `.env.local` and `.env` are gitignored so the in-progress file is never committed even if the developer forgets to clean it up.

### Loading rules

- Use `dotenv` only when `NODE_ENV !== 'production'`. In Keboola, env vars are already injected — do not call `dotenv.config()` there.
  ```js
  if (process.env.NODE_ENV !== 'production') {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
  }
  ```
- Strip a leading `#` from `KBC_TOKEN` defensively before use — some injection paths still prepend it.
- Validate required env vars at startup; fail fast with a clear message listing what is missing.

### `.gitignore` must contain

```
node_modules
dist
.env
.env.local
*.local
.DS_Store
.keboola
.vscode
```

`.env.example` **is** committed. `.env` and `.env.local` are **never** committed.

---

## 4. Storage Access

Three paths. Pick whichever matches the workload — Claude should ask before generating code.

### Option A — Storage Access via Query Service (recommended for read/write to live Storage tables)

Per https://help.keboola.com/data-apps/storage-access/ and the Query Service API doc (https://api.keboola.com/?service=query), when Storage Access is enabled and writable tables are configured in *Advanced Settings*, the platform provisions an ephemeral workspace for the Data App. The app talks to the Query Service over HTTP — **not** directly to Snowflake/BigQuery via a warehouse driver.

The endpoint is:

```
POST {deriveQueryServiceUrl(KBC_URL)}/api/v1/branches/{BRANCH_ID}/workspaces/{SANDBOX_ID}/queries
```

`SANDBOX_ID` is the workspace ID. The four env vars (`BRANCH_ID`, `KBC_URL`, `KBC_TOKEN`, `SANDBOX_ID`) are all the app needs.

```js
function deriveQueryServiceUrl(kbcUrl) {
  const u = (kbcUrl || '').replace(/\/+$/, '');
  if (!/^https?:\/\/connection\./.test(u)) {
    throw new Error(`Cannot derive Query Service URL from KBC_URL "${kbcUrl}".`);
  }
  return u.replace(/^(https?):\/\/connection\./, '$1://query.');
}

function loadQueryServiceConfig() {
  const required = ['BRANCH_ID', 'KBC_URL', 'KBC_TOKEN', 'SANDBOX_ID'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Query Service env vars missing: ${missing.join(', ')}.`);
  }
  return {
    branchId: process.env.BRANCH_ID,
    workspaceId: process.env.SANDBOX_ID, // Data App sandbox doubles as workspace ID
    queryServiceUrl: deriveQueryServiceUrl(process.env.KBC_URL),
    token: (process.env.KBC_TOKEN || '').replace(/^#/, ''),
  };
}

async function querySql(statements) {
  const cfg = loadQueryServiceConfig();
  const url =
    `${cfg.queryServiceUrl}/api/v1/branches/${cfg.branchId}` +
    `/workspaces/${cfg.workspaceId}/queries`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-StorageApi-Token': cfg.token,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      statements: Array.isArray(statements) ? statements : [statements],
    }),
  });
  if (!res.ok) {
    throw new Error(`Query Service ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// Usage
const results = await querySql([
  'SELECT * FROM "in.c-main"."customers" LIMIT 1000',
]);
```

Notes:
- **Snowflake-only at present.** BigQuery support is on the Keboola roadmap.
- **`SANDBOX_ID` is the workspace ID.** Don't look for a separate `WORKSPACE_ID` variable — it isn't there.
- **Sandbox is ephemeral.** A fresh one is created on every deploy/redeploy/wake-from-sleep. Read `SANDBOX_ID` from `process.env` every time you build a URL — don't cache it.
- **The Query Service accepts raw SQL — no parameterized queries.** Validate every untrusted value before interpolating it. Coerce numbers with `parseInt`/`parseFloat`; for strings, use an allowlist of permitted values whenever possible.
- **Metadata refresh is automatic** after writes — row counts and table stats in the Storage UI stay current with no extra calls.
- **Audit logging for writes.** Per Keboola's best practices (https://help.keboola.com/data-apps/storage-access/#best-practices), the Query Service auto-tracks writes for billing, but that's not an application audit log. Emit a structured JSON log line on every write so "who did what, when, on which row" shows up in the Data App's **Terminal Log** tab:
  ```js
  function auditLog(event, fields = {}) {
    console.log(JSON.stringify({
      level: 'info',
      event,                          // 'storage_write', 'storage_truncate', etc.
      timestamp: new Date().toISOString(),
      ...fields,
    }));
  }

  // At each write site:
  auditLog('storage_write', {
    user: currentUser,
    action: 'update_status',
    table: 'in.c-main.approvals',
    row_id: recordId,
    new_value: newStatus,
  });
  await querySql([/* UPDATE ... */]);
  ```
  Never log tokens, credentials, or full row contents — log identifiers and the field that changed.

### Option B — Input Mapping (snapshot tables and files at startup)

When the workload is "read this data once at startup," configure **Input Mapping** in the Data App configuration. Keboola copies the data into the container before the app starts. No driver, no API, just file I/O. The snapshot is refreshed on redeploy, not in real time.

**Tables** land at `/data/in/tables/<table>.csv`:

```js
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const rows = parse(readFileSync('/data/in/tables/my_table.csv'), {
  columns: true,
  skip_empty_lines: true,
});
```

**Files** (PDFs, images, JSON, archives — anything non-tabular) land at `/data/in/files/<file-id>` with a `.manifest` sibling JSON containing metadata:

```js
import { readFileSync, readdirSync } from 'fs';

// Read one specific file by ID (matched to the Data App config's Files mapping):
const buffer = readFileSync('/data/in/files/<file-id>');

// Or enumerate everything that was mapped in:
for (const name of readdirSync('/data/in/files')) {
  if (name.endsWith('.manifest')) continue;
  const content = readFileSync(`/data/in/files/${name}`);
  const meta = JSON.parse(readFileSync(`/data/in/files/${name}.manifest`, 'utf8'));
  // meta.id, meta.name, meta.tags, meta.created — use to map back to human-readable names
}
```

Use Input Files for anything not naturally tabular — large assets, AI fine-tuning data, model weights, design files, etc.

### Option C — Plain Storage REST API (metadata, descriptions, tags, branch info)

For non-SQL operations — listing buckets and tables, reading column metadata, updating descriptions or tags — call the Storage REST API directly with `X-StorageApi-Token`. Both `KBC_URL` and `KBC_TOKEN` are platform-injected, so no extra secret declaration is needed.

```js
const KBC_URL = (process.env.KBC_URL || '').replace(/\/+$/, '');
const KBC_TOKEN = (process.env.KBC_TOKEN || '').replace(/^#/, '');
const BRANCH_ID = process.env.BRANCH_ID || 'default';

async function kbcFetch(path, init = {}) {
  const res = await fetch(`${KBC_URL}${path}`, {
    ...init,
    headers: {
      'X-StorageApi-Token': KBC_TOKEN,
      'Accept': 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Keboola API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// Examples
const tables   = await kbcFetch(`/v2/storage/buckets/out.c-app/tables?include=metadata`);
const branchMd = await kbcFetch(`/v2/storage/branch/${BRANCH_ID}/metadata`);
```

Notes:
- **Empty objects (`{}`) are not "not found"** — check `Object.keys(...).length` if absence matters.
- **Use `Content-Type: application/json`.** Form-urlencoded variants are deprecated.
- **Data preview has a 30-column sync limit.** Batch with the `columns` query param for wide tables.
- For SQL operations, prefer Option A. The REST API is intended for metadata work.

---

## 5. Local Testing — Run and Validate Before Deploying

After the project is scaffolded, walk the user through verifying it boots locally before touching the Keboola UI. This catches the vast majority of deployment failures where they're easy to fix.

### Steps

1. Open `.env.local` (Claude already created it as a blank template during scaffolding). Fill in all four platform vars: `BRANCH_ID`, `KBC_URL`, `KBC_TOKEN`, `SANDBOX_ID` (the latter doubles as the workspace ID for the Query Service). Leave blank to use mock mode if the app supports one. If the file isn't there for any reason, regenerate it with `cp .env.example .env.local`.
2. `npm install`
3. **Dev mode** (HMR for frontend, API on :3000): `npm run dev`. For Vite + Express setups, the Vite dev server runs on :5173 and proxies API calls to :3000 — start both, or use a single `npm run dev` script that runs both concurrently.
4. **Production-like mode**: `npm run build && npm start`. This is closer to how the app runs inside Keboola — Express serves the built static assets and the API on :3000.

### Validation checklist

- Open the app URL in a browser. The home page renders.
- `curl http://localhost:3000/api/health` returns 200 and reflects the env state.
- `curl -X POST http://localhost:3000/` returns 200. **This is the Keboola startup probe — if it returns 405, fix the `app.all('/')` handler from Section 1 before deploying or the deploy will fail.**
- If the app uses Storage Access locally (rare — usually you mock it), exercise at least one query.
- `npm run build` succeeds — TypeScript errors that dev mode hides surface here.

If anything fails, fix it before moving to deployment. The Keboola Terminal Log is helpful but slower to iterate on than `console.log` on your own machine.

---

## 6. Deployment to Keboola

Two parts: get the code onto a git remote, then point a new Keboola Data App configuration at that remote.

### A. Push the code to a git remote

1. `git remote -v` — if there is no `origin`, prompt the user to create a repository on GitHub, GitLab, or Bitbucket. Public or private both work; private requires extra credentials at the Keboola side (see B.5).
2. After they create the empty remote: `git remote add origin <url>`.
3. `git status` — verify no uncommitted changes. Stage and commit anything outstanding with a clear message. **Make sure `.env.local` and any other secret files are not staged** — `git status` lists them as untracked when `.gitignore` is wired correctly. If it doesn't, fix the gitignore before pushing.
4. `git push -u origin main` (or `master`).
5. Verify the remote is browsable / cloneable. Keboola will need either anonymous read access (public repo) or credentials (private repo).

### B. Create the Keboola Data App configuration

In the Keboola project UI:

1. Go to **Apps** (sidebar) and click **Create App**.
2. Choose **Python/JS** as the type. Both share the same configuration UI — this section produces JS apps.
3. Under **Repository**, paste the git repository URL.
4. Select the **branch** to deploy from. For production, pin to a specific tag or commit. For a staging app, track a branch like `main` or `develop`.
5. If the repository is private, enable **Private repository** and authenticate with either:
   - **Personal Access Token** — GitHub username + a personal access token.
   - **SSH Private Key** — paste the SSH private key for key-based authentication.
6. **Secrets** section: only declare variables the platform does **not** auto-inject. The platform-injected vars (`BRANCH_ID`, `KBC_URL`, `KBC_TOKEN`, `SANDBOX_ID`) appear in the container automatically — don't add them as secrets. **Do** add any third-party API keys or other custom secrets the app needs. Each custom-secret key takes a `#` prefix in the UI (e.g., `#ANTHROPIC_API_KEY`).
7. **Storage Access** (Advanced Settings → Storage Access): if the app reads/writes Storage tables via the Query Service, click *+ Add Writable Table* and select each table the app needs SELECT/INSERT/UPDATE/DELETE/TRUNCATE on. The feature must first be turned on under *Project Settings → Features → Storage Access*. Snowflake-only.

   **Programmatic alternative** (CI / automation / IaC): instead of the UI, set writable tables in the Data App configuration JSON under `storage.output.tables[*]` with `unload_strategy: "direct-grant"`. Each entry's `destination` is the full Storage table ID; the table must exist before deploy.
   ```json
   {
     "storage": {
       "output": {
         "tables": [
           { "destination": "out.c-app.approvals", "unload_strategy": "direct-grant" },
           { "destination": "out.c-app.audit_log", "unload_strategy": "direct-grant" }
         ]
       }
     }
   }
   ```
   Push the updated config via the Storage Component Configurations API and **redeploy** the app — permission changes only take effect on the next deploy/redeploy/wake-from-sleep since the workspace is ephemeral. Reference: https://help.keboola.com/data-apps/storage-access/#configuring-writable-tables-programmatically.

8. **Input Mapping** (only if the app reads from `/data/in/`): pick the **tables** to map (they land at `/data/in/tables/<table>.csv`) and/or **files** to map (they land at `/data/in/files/<file-id>` plus a `.manifest` JSON sibling with metadata).
9. Click **Deploy**. Keboola clones the repo, runs `setup.sh`, and starts supervisord. The first deployment may take a few minutes.
10. When the build finishes, a URL appears at the top of the configuration. Open it and verify `/api/health` returns 200, then exercise the app.

### Redeploying

Push new code to the tracked branch/tag, then click **Redeploy** in the Data App configuration.

### Debugging a failed deployment

The **Terminal Log** tab inside the Data App configuration shows stdout/stderr from supervisord — that's the first place to look. Common failures:

- `command not found` → `app.conf` uses a relative path; switch to an absolute path (`/app/...`).
- `Cannot find module` → `setup.sh` didn't run `npm install`, or a dependency is missing from `package.json`.
- `Method Not Allowed` on first open → the POST handler on `/` was skipped; see Section 1.
- App boots but says env var is undefined → either Storage Access wasn't enabled (so the platform vars aren't set) or a custom secret name in the UI doesn't match what the code reads (case, dashes vs underscores, missing `#` prefix in the UI).

---

## 7. Deliverables Checklist for Claude

Before declaring the scaffold complete or the deployment done, verify:

- [ ] `git status` is clean and the latest code is pushed to the remote being tracked by Keboola.
- [ ] `keboola-config/setup.sh`, `nginx/sites/default.conf`, `supervisord/services/app.conf` are present and match the templates above.
- [ ] `keboola-config/supervisord/services/app.conf`'s `command=` uses an **absolute path** that points at the entry script that exists.
- [ ] `package.json` has `start`, `build`, and `dev` scripts; `"type": "module"` is set if using ESM.
- [ ] `server/index.js` listens on `process.env.PORT || 3000` and handles **both GET and POST** on `/` (the Keboola startup probe).
- [ ] `.env.example` lists every variable the code reads, using the canonical platform names (`BRANCH_ID`, `KBC_URL`, `KBC_TOKEN`, `SANDBOX_ID`) for auto-injected vars and `#`-noted custom secrets for the rest. The Query Service URL is **derived from `KBC_URL`** in code; the workspace ID is **`SANDBOX_ID`**. Neither is a separate env var.
- [ ] `.env.local` is created as a **blank template only** (no real values filled in), and the user has been told explicitly to open it and fill in **every** required variable — `BRANCH_ID`, `KBC_URL`, `KBC_TOKEN`, `SANDBOX_ID`. Don't shorten the reminder to a single variable.
- [ ] If the app is a dashboard, report, KPI viewer, or similar — visual quality has been planned per Section 2: real design system (not raw HTML), proper chart library, polished tables with sortable headers and empty states, deliberate color palette, loading and error states, consistent typography. If polish was deliberately skipped, the user explicitly asked.
- [ ] `.gitignore` contains `.env`, `.env.local`, `*.local`, `node_modules`, `dist`. Confirm with `git check-ignore -v .env.local`.
- [ ] Storage access uses the right path: Query Service via direct `fetch` against `/api/v1/branches/{BRANCH_ID}/workspaces/{SANDBOX_ID}/queries` for SQL, Input Mapping for snapshot reads, plain REST only for metadata. **No code uses `KBC_WORKSPACE_HOST/USER/PASSWORD`, `WORKSPACE_ID`, or `KBC_WORKSPACE_MANIFEST_PATH` — the workspace ID is `SANDBOX_ID`.**
- [ ] `/api/health` returns 200 without auth; `POST /` returns 200.
- [ ] `README.md` documents: how to run locally, the platform-injected env vars the app expects, how to enable Storage Access in *Advanced Settings*, which **custom** secrets to declare in the Data App configuration UI (with `#` prefix), and a "Deploying" section mirroring Section 6.
- [ ] `npm run build` succeeds with no errors.
- [ ] `curl -X POST http://localhost:3000/` returns 200 — verifies the Keboola startup probe will pass.
