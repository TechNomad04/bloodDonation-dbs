## Blood Donation - Full Stack App

Modern MERN application for managing blood banks, donors, patients, and requests with Superadmin and Bank Admin roles.

### Stack
- Backend: Node.js, Express, Mongoose, JSON Web Tokens
- Frontend: React + Vite, React Router
- DB: MongoDB

---

## 1) Project Structure
```
backend/   Express API + MongoDB models
frontend/  React app (Vite)
```

---

## 2) Quick Start

Prereqs: Node 18+, MongoDB connection string

1. Configure backend environment:
   - Create `backend/.env`:
     ```env
     PORT=5000
     MONGO_URL=<your-mongodb-connection-string>
     JWT_SECRET=<strong-secret>
     SEED_SUPERADMIN_EMAIL=superadmin@example.com
     SEED_SUPERADMIN_PASSWORD=superadmin123
     ```

2. Install, seed, and run services:
   - Backend
     ```bash
     cd backend
     npm install
     npm run seed
     npm run dev
     ```
     API at `http://localhost:5000`

   - Frontend (new terminal)
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
     App at the printed Vite URL (typically `http://localhost:5173`)

---

## 3) Accounts and Access

- Superadmin (seeded via `npm run seed`)
  - Email: from `SEED_SUPERADMIN_EMAIL` (`superadmin@example.com` by default)
  - Password: from `SEED_SUPERADMIN_PASSWORD` (`superadmin123` by default)
  - After login you will be redirected to `/superadmin` where you can create blood banks and specify per‑bank admin credentials.

- Bank Admin
  - Seeded example for demo bank:
    - Email: `admin@central.com`
    - Password: `admin123`
  - After login you will be redirected to `/admin`.
  - Any new bank created by the Superadmin uses the admin email/password entered in the “Add Blood Bank” form.

- Donor/Patient
  - Create via the app’s signup form (roles available: `donor`, `patient`).

Routes after login are enforced by role:
- Superadmin → `/superadmin`
- Admin → `/admin`
- Donor → `/donor`
- Patient → `/patient`

---

## 4) Frontend Configuration

The frontend uses `frontend/src/api.js` with `baseURL` defaulting to `http://localhost:5000`. If you change the backend port or host, update that file or set up a proxy.

---

## 5) Useful Scripts

Backend (`backend/package.json`):
- `npm run dev` – start API server
- `npm run seed` – seed Superadmin, demo bank, and demo bank admin

Frontend (`frontend/package.json`):
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built site

---

## 6) APIs (Brief)

Base URL: `http://localhost:5000`
- `POST /auth/signup` – donor/patient signup
- `POST /auth/login` – login (all roles)
- `GET /banks` – list banks (auth required)
- `POST /banks` – create bank (superadmin)
- `DELETE /banks/:id` – delete bank (superadmin)
- `GET /admin/users` – list users in admin’s bank (admin)
- `POST /admin/users` – create donor/patient in admin’s bank (admin)
- `DELETE /admin/users/:id` – delete user (admin)
- `POST /requests/donate` – donor creates donation request (donor)
- `POST /requests/receive` – patient creates request to receive blood (patient)
- `GET /requests/pending` – pending requests for admin’s bank (admin)
- `POST /requests/:id/approve` – approve a request (admin)
- `POST /requests/:id/reject` – reject a request (admin)

All protected endpoints require `Authorization: Bearer <token>`.

---

## 7) Troubleshooting

- Backend won’t start / Mongo errors:
  - Verify `backend/.env` and `MONGO_URL`.
  - Ensure your IP is allowed in Atlas (if using MongoDB Atlas).

|- 401 Unauthorized in frontend:
  - Your token may be missing/expired. Login again.

- Port conflicts:
  - Change frontend port: `npm run dev -- --port 5174`
  - Change backend port: set `PORT` in `backend/.env` and restart.

---

## 8) Security Notes
- Change all default secrets and seeded passwords in production.
- Prefer environment variables for secrets and connection strings.

---

## 9) License
MIT (or your preferred license)


