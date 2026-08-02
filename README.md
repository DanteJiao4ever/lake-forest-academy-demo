# Lake Forest Academy website

Official website source for Lake Forest Academy in North York, Ontario.

The site is built with React and Vite and is configured for GitHub Pages through `.github/workflows/deploy-pages.yml`.

The online-learning frontend is in `public/learning/`. Its private API,
PostgreSQL schema, Drive adapters and deployment notes are in `backend/README.md`.

## Learning API cutover

The Pages build reads `LFA_API_ORIGIN` from a GitHub Actions repository
variable and writes it to `learning/runtime-config.json`. Leave the variable
empty until the production API and `/health/ready` are available. Set
`LFA_API_HEALTH_PATH=/health/ready`; the learning bootstrap checks that endpoint
before enabling login, registration and database-backed course services. It
checks `/health/upload-ready` separately before enabling Drive uploads, so a
scanner or Drive outage does not unnecessarily disable sign-in.

After the API is healthy, set `LFA_API_ORIGIN` to the HTTPS API origin (for
example `https://api.lakeforestacademy.ca`) and run the Pages workflow. Optional
repository variables are `LFA_API_HEALTH_PATH`,
`LFA_API_UPLOAD_HEALTH_PATH`, `LFA_API_HEALTH_TIMEOUT_MS`,
`LFA_GOOGLE_AUTH_START` and `LFA_DRIVE_SYNC_PATH`.

## Local commands

```bash
npm install
npm run dev
npm run build
```
