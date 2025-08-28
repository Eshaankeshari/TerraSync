# TerraSync MVP

TerraSync is a civic technology platform enabling citizens in Indian cities to report urban waste issues and municipal authorities to manage and resolve them.

## Tech Stack
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Multer
- Frontend: React (Vite + TypeScript)
- Auth: JWT (citizen, municipal)
- Storage: Local uploads by default; S3-ready stubs

## Monorepo Structure
```
server/   # Express API
client/   # React UI
```

## Prerequisites
- Node.js 18+
- npm or pnpm
- MongoDB 6+ (local or Atlas). Optionally: `docker compose up -d` to run mongo locally.

## Quickstart
1) Start MongoDB (choose one):
- Local MongoDB service OR
- Docker: `docker compose up -d`

2) Backend
```
cd server
cp .env.example .env
npm install
npm run dev
```
API on `http://localhost:4000`. Health: `GET /health`.

3) Frontend
```
cd client
cp .env.example .env
npm install
npm run dev
```
App on `http://localhost:5173`.

4) Seed sample data (optional)
```
cd server
npm run build && node dist/seed.js
```
Creates a citizen `asha@example.com` (password: `password123`) and municipal `admin@city.gov` (password: `admin123`).

## Environment Variables
See `server/.env.example` and `client/.env.example`.

## API Overview
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Reports (citizen):
  - `POST /api/reports` create
  - `GET /api/reports/mine`
  - `GET /api/reports/nearby?lat=..&lng=..&radiusMeters=..`
  - `POST /api/reports/:id/confirm`
- Reports (municipal):
  - `GET /api/reports`
  - `GET /api/reports/:id`
  - `PATCH /api/reports/:id/status`
- Uploads: `POST /api/uploads` (multipart field `image`) -> returns `{ url }`

## Deployment
### AWS (recommended for MVP)
- Backend: Elastic Beanstalk or ECS Fargate
  - Build: `npm run build`
  - Set env vars in the environment
  - Use MongoDB Atlas connection string in `MONGODB_URI`
  - For image storage, set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` and replace local multer with S3 storage
- Frontend: S3 + CloudFront
  - Build with `npm run build`
  - Upload `client/dist/` to S3 and serve via CloudFront

### Firebase
- Frontend: Firebase Hosting (`client/dist`)
- Backend: Cloud Run (containerize server) + MongoDB Atlas

## Notes
- Geospatial queries rely on a 2dsphere index defined in `Report` model.
- Local uploads are served from `/uploads`. In production prefer S3.
- Keep JWT secret secure and rotate periodically.