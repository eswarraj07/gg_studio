# GG Studio website

Photography studio website with a password-protected admin area for managing
the services shown on the home page and the photos inside each one.

The whole site runs as **one Railway service**. There is no database, no
separate file storage account and nothing else to keep alive.

| Part        | What it is                                                        |
| ----------- | ----------------------------------------------------------------- |
| Site        | Astro (server-rendered) running on Node.js 22                     |
| Hosting     | Railway, one service, built from this GitHub repository           |
| Content     | `services.json` + photo files on a Railway Volume mounted at `/data` |
| Admin       | `/admin`, one shared password                                     |

**Current deployment:** Railway project `gg-studio`, service `gg-studio`,
live at https://gg-studio-production-c8c7.up.railway.app (until a custom
domain is attached).

---

## Contents

1. [How it works](#1-how-it-works)
2. [Deploy to Railway, step by step](#2-deploy-to-railway-step-by-step)
3. [Verify the deployment](#3-verify-the-deployment)
4. [Add a custom domain](#4-add-a-custom-domain)
5. [Using the admin](#5-using-the-admin)
6. [Making changes to the site](#6-making-changes-to-the-site)
7. [Backups and restore](#7-backups-and-restore)
8. [Handing the project to someone else](#8-handing-the-project-to-someone-else)
9. [Local development](#9-local-development)
10. [Environment variables](#10-environment-variables)
11. [Troubleshooting](#11-troubleshooting)
12. [Commands](#12-commands)

---

## 1. How it works

- The home page lists **services** (Bride Portraits, Maternity, …). Each
  service has up to 10 **photos**. The first photo is the cover tile.
- All of that content is stored in one folder, the **data directory**:
  - `services.json` holds the service names, their order and the photo
    metadata (alt text, order, file name).
  - `photos/<service-name>/…` holds the image files.
- On Railway the data directory is a **Volume** mounted at `/data`. A volume
  is a disk that survives redeploys, restarts and code changes. The app finds
  it automatically through Railway's `RAILWAY_VOLUME_MOUNT_PATH` variable.
- The repository also contains a copy of the content in its `data/` folder.
  This is the **seed**: the first time the app starts with an empty volume,
  it copies the seed onto it. After that the volume is the source of truth
  and the admin area edits it directly. The seed is never applied again.
- Photos are served by the app itself at `/photos/<service-name>/<file>`.
  The hero image at the top of the page is a static file under `public/hero/`
  and is only changed through code.

---

## 2. Deploy to Railway, step by step

You need: a GitHub account that can see this repository, and a Railway
account (https://railway.com, the free Hobby trial works to start; the Hobby
plan is about USD 5/month plus usage).

### 2.1 Put the code on GitHub

If the repository is not already in the account that will own the
deployment, fork it or push it to a new repository there. Railway deploys
from the `master` branch.

### 2.2 Create the Railway project and service

1. Sign in at https://railway.com and click **New Project**.
2. Choose **Deploy from GitHub repo**. The first time, Railway asks to install
   its GitHub app. Grant it access to this repository.
3. Pick the repository and the `master` branch. Railway creates a service and
   starts a build. The build uses `railway.json` in this repo: install
   dependencies, `npm run build`, then start `node ./dist/server/entry.mjs`.
4. The first build may finish before the next steps are done. That is fine;
   every change below triggers a fresh deploy.

### 2.3 Attach the volume

1. Open the service, then **Settings → Volumes** (or right-click the service
   card on the canvas and pick **Attach Volume**).
2. Mount path: `/data`. Leave the size at the default (5 GB is plenty for
   thousands of photos).
3. Save. Railway redeploys the service with the volume attached.

Without a volume the site still works, but anything uploaded in the admin is
lost on the next deploy. The server logs a warning in that case.

### 2.4 Set the variables

Open the service, then the **Variables** tab, and add:

| Variable         | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| `ADMIN_PASSWORD` | the password for `/admin`. Pick something long.                 |
| `SESSION_SECRET` | any long random string. In a terminal: `openssl rand -hex 32`.  |

Click **Deploy** when Railway offers it. Nothing else is required; do not set
`DATA_DIR` on Railway.

### 2.5 Generate a public address

**Settings → Networking → Generate Domain**. Railway gives the service an
address like `https://gg-studio-production-xxxx.up.railway.app`. For the
studio's own domain see [section 4](#4-add-a-custom-domain).

### 2.6 Wait for the deploy

The **Deployments** tab shows the build. It takes about two minutes. The
status should end as **Active**.

### 2.7 Same thing from the command line (optional)

If you prefer the Railway CLI (`npm i -g @railway/cli`), this is the whole
setup; run it from the repository folder:

```sh
railway login
railway init --name gg-studio
railway add --service gg-studio --repo <github-user>/craftnexa --branch master \
  --variables "ADMIN_PASSWORD=<password>" \
  --variables "SESSION_SECRET=$(openssl rand -hex 32)"
railway volume add --mount-path /data
railway domain
railway deployment list      # wait for SUCCESS
```

---

## 3. Verify the deployment

Open the generated address and check:

1. The home page loads with the hero photo and the grid of services with
   cover photos.
2. Clicking a service opens its photo gallery.
3. `https://<address>/admin` redirects to the login page. Log in with
   `ADMIN_PASSWORD`.
4. Open any service in the admin, upload a photo, and confirm it appears on
   the home page. Delete it again if it was only a test.
5. In Railway, open **Deployments → ⋮ → Redeploy**. After it finishes, the
   photo you uploaded (or any rename) should still be there. That proves the
   volume is working.

In the service **Logs** you should see `Server listening on` and, only on the
very first start, `[storage] seeding /data from …`.

---

## 4. Add a custom domain

1. In Railway: service **Settings → Networking → Custom Domain**, enter the
   domain (for example `www.ggstudio.in`) and click **Add**.
2. Railway shows a DNS record to create: usually a **CNAME** pointing to a
   `*.up.railway.app` host. For a bare domain without `www`, Railway shows an
   A/ALIAS record instead.
3. Create that record at the domain registrar (GoDaddy, Namecheap,
   Cloudflare, …). If using Cloudflare, set the record to **DNS only** (grey
   cloud) until Railway shows the domain as verified.
4. Wait for the status in Railway to turn green. HTTPS certificates are
   issued automatically. It can take from a few minutes to a few hours.
5. Open `src/data/content.js` and update any absolute links if needed (the
   site itself uses relative URLs, so normally nothing changes).

The CSRF protection in `astro.config.mjs` already trusts any
`*.up.railway.app` host. If the admin forms stop working on the custom domain
with a "Cross-site POST form submissions are forbidden" error, add the domain
to the `allowedDomains` list there and push.

---

## 5. Using the admin

1. Go to `https://<your-domain>/admin` and enter the password. The login
   lasts for a while and then asks again.
2. **Services page**: add a service by name, rename it, move it up or down
   (this is the order on the home page), or delete it. Deleting a service
   also deletes its photos.
3. **Service page**: upload photos (JPG, PNG, WEBP, GIF or AVIF; up to 10 per
   service), reorder them, edit the alt text (shown to screen readers and
   search engines), or delete them. The first photo is the cover tile on the
   home page.
4. Changes are live immediately. There is nothing to publish.

Photos are stored on the volume at `/data/photos/<service-name>/` with a
timestamp in the file name, so re-uploading a file with the same name is safe.

Tips for good results: landscape or portrait photos around 1200 to 2000 px
on the long side and under about 500 KB load fastest. Very large originals
work but slow the page down.

---

## 6. Making changes to the site

Anything that is not a service or a photo (text, contact details, hero image,
colours, layout) is code:

| Change                                | Where                                            |
| ------------------------------------- | ------------------------------------------------ |
| Studio name, phone, WhatsApp, address, map, social links, testimonials | `src/data/content.js` |
| Hero photo                            | replace the three files in `public/hero/`        |
| Section text and layout               | `src/components/*.astro`                         |
| Colours and fonts                     | `src/styles/global.css`                          |
| Photo limit per service               | `MAX_PHOTOS_PER_SERVICE` in `src/lib/file-storage.js` |

Commit and push to `master`. Railway rebuilds and deploys automatically; the
volume (and therefore the photos and services) is untouched by deploys.

---

## 7. Backups and restore

### Back up

- **From the repo content:** `npm run package-photos` writes
  `gg-studio-photos.zip` with `services.json`, one folder of photos per
  service, and the hero images. This reflects the seed in `data/`, not the
  live volume.
- **From the live volume:** open a shell on the service with `railway ssh`
  (CLI linked to the project) and copy `/data` out, or run
  `DATA_DIR=/data npm run package-photos` there. Railway also offers volume
  backups under the volume's settings on paid plans.

### Restore onto a volume

1. Unzip the backup.
2. Copy `services.json` and the `photos/` folder into `/data` on the service
   (via `railway ssh`, or by attaching the volume to a temporary service).
3. Restart the service from the Deployments tab.

### Reset to the seed

Delete everything inside `/data` (or detach the volume and attach a fresh
one) and restart. The app seeds the empty volume from the repo's `data/`
folder again.

---

## 8. Handing the project to someone else

Two options:

- **Transfer the Railway project.** In Railway, open the project, then
  **Settings → Transfer Project**, and enter the new owner's Railway account.
  They accept the transfer and from then on it bills to them. The GitHub
  connection stays, so they also need access to the GitHub repository (or
  reconnect the service to their own fork under **Settings → Source**).
- **Keep hosting it** and simply share the site URL and the admin password.

Either way, change `ADMIN_PASSWORD` in the Variables tab when ownership
changes, and keep `SESSION_SECRET` private.

---

## 9. Local development

Requires Node.js 22.12 or newer.

```sh
cp .env.example .env     # set ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run dev              # http://localhost:4321
```

Locally the data directory is the repo's own `data/` folder. Uploads made in
the local admin land in `data/photos/` and `data/services.json`, so committing
them updates the seed used for any future fresh volume. To work against a
scratch copy instead, set `DATA_DIR=/some/other/folder` in `.env`.

To check the production build locally:

```sh
npm run build
ADMIN_PASSWORD=x SESSION_SECRET=y DATA_DIR=/tmp/gg-data PORT=4321 npm start
```

---

## 10. Environment variables

| Variable                    | Required | Notes                                                                   |
| --------------------------- | -------- | ----------------------------------------------------------------------- |
| `ADMIN_PASSWORD`            | yes      | Login for `/admin`.                                                     |
| `SESSION_SECRET`            | yes      | Signs the admin login cookie. Changing it logs everyone out.            |
| `DATA_DIR`                  | no       | Overrides the data directory. Leave unset on Railway.                   |
| `RAILWAY_VOLUME_MOUNT_PATH` | auto     | Set by Railway when a volume is attached. Used when `DATA_DIR` is unset. |
| `PORT`, `HOST`              | auto     | Set by Railway. Locally default to 4321 and 0.0.0.0.                    |

---

## 11. Troubleshooting

**Photos disappear after a deploy.** No volume is attached, or it is mounted
somewhere other than what the app uses. Check **Settings → Volumes** shows a
volume on this service, and that `DATA_DIR` is not set to something else.
The logs will contain `No volume attached` in this case.

**Admin login always bounces back to the login page.** `ADMIN_PASSWORD` or
`SESSION_SECRET` is missing, or the password is wrong. Check the Variables
tab. If you changed `SESSION_SECRET`, just log in again.

**"Cross-site POST form submissions are forbidden".** The site is being
served from a host that is not in `allowedDomains` in `astro.config.mjs`.
Add the domain and push.

**Build fails.** Open the failed deployment's build logs. The usual cause is
a syntax error in a recently edited file. The previous deployment keeps
serving until a new one succeeds.

**Upload says "Unsupported file type".** Only JPG, PNG, WEBP, GIF and AVIF
are accepted. HEIC photos from iPhones must be converted first.

**Site is slow to load the first time after a while.** On the Hobby plan
Railway may sleep an idle service if "App Sleeping" is enabled in Settings.
Turn it off for an always-on site.

---

## 12. Commands

| Command                  | Action                                           |
| ------------------------ | ------------------------------------------------ |
| `npm run dev`            | Start the dev server                             |
| `npm run build`          | Build to `dist/`                                 |
| `npm start`              | Run the production build                         |
| `npm run package-photos` | Zip the current content for handoff or backup    |
