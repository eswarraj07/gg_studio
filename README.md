# GG Studio website

Photography studio website with a small password-protected admin area for
managing the services shown on the home page and the photos in each one.

Everything runs as **one Railway service**. There are no other accounts or
third-party services to maintain.

- Site: Astro (server-rendered) on Node.js
- Content: `services.json` + photo files, stored on a Railway Volume
- Admin: `/admin` (single shared password)

## Deploy to Railway (one time)

1. **Create the project.** In Railway: *New Project → Deploy from GitHub repo*
   and pick this repository. Railway detects `railway.json` and builds with
   `npm install && npm run build`.

2. **Attach a Volume.** On the service, open *Settings → Volumes → Add Volume*
   and set the mount path to `/data`. This is where the photos and
   `services.json` live, so edits made in the admin survive every redeploy.
   (CLI alternative: `railway volume add --mount-path /data`.)

3. **Set variables.** On the service, open *Variables* and add:

   | Variable         | Value                                                   |
   | ---------------- | ------------------------------------------------------- |
   | `ADMIN_PASSWORD` | the password for `/admin`                               |
   | `SESSION_SECRET` | any long random string (e.g. `openssl rand -hex 32`)    |

   Nothing else is needed. The app finds the volume through Railway's
   `RAILWAY_VOLUME_MOUNT_PATH` variable automatically.

4. **Generate a domain.** *Settings → Networking → Generate Domain* (or attach
   a custom domain). Redeploy if Railway does not do it automatically.

On the first start the app copies the photos and `services.json` committed in
this repo's `data/` folder onto the empty volume. After that, the volume is
the source of truth and the admin area edits it directly.

## Using the admin

1. Go to `https://<your-domain>/admin` and log in with `ADMIN_PASSWORD`.
2. Add, rename, reorder or delete services.
3. Open a service to upload photos (up to 10 per service), reorder them,
   edit alt text or delete them. The first photo is the cover on the home page.

Uploads are stored on the volume under `/data/photos/<service-name>/`.

## Local development

```sh
cp .env.example .env     # set ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run dev              # http://localhost:4321
```

Locally the data directory is the repo's own `data/` folder, so anything you
upload in the local admin becomes part of the seed content the next time it
is committed and deployed to a fresh volume.

## Backing up or restoring photos

`npm run package-photos` writes `gg-studio-photos.zip` containing
`services.json`, one folder of photos per service and the hero images.

To restore it onto a Railway volume, unzip it and copy `services.json` and
the `photos/` folder into the mounted `/data` directory (for example with
`railway ssh` or a one-off shell on the service), then restart the service.

## Environment variables

| Variable         | Required | Notes                                                              |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `ADMIN_PASSWORD` | yes      | Login for `/admin`                                                 |
| `SESSION_SECRET` | yes      | Signs the admin login cookie                                       |
| `DATA_DIR`       | no       | Overrides the data directory. Unset on Railway (volume is used)    |

## Commands

| Command                  | Action                                      |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Start the dev server                        |
| `npm run build`          | Build to `dist/`                            |
| `npm start`              | Run the production build                    |
| `npm run package-photos` | Zip the current content for handoff/backup  |
