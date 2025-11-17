# E-Clinic

A modern telemedicine web app built with Next.js that supports patient, doctor, and admin workflows: appointments, online video consultations, medical records, inventory, notifications, and more.

## Features
- Patient dashboard for appointments, consultations, records, card, and inventory
- Doctor dashboard for managing patients and consultations
- Admin dashboard for users, doctors, appointments, and inventory
- Secure authentication with JWT (HttpOnly cookie)
- Email notifications via Gmail (Nodemailer)
- Video calls using VDO.Ninja (default) or Jitsi Meet
- MongoDB storage via Mongoose
- Tailwind CSS v4 UI with lucide icons

## Tech Stack
- Next.js 16 (App Router), React 19
- Tailwind CSS v4
- MongoDB + Mongoose
- Auth: `jose` (JWT), `bcryptjs`
- Email: `nodemailer`
- Storage: `@vercel/blob`
- Icons: `lucide-react`

## Quick Start
### Prerequisites
- Node.js 18 or newer
- A MongoDB instance (Atlas or self-hosted)
- SMTP credentials (Gmail recommended; app password required)

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root with:
   ```bash
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
   JWT_SECRET=replace-with-strong-secret
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=your-gmail-app-password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build and run production locally:
   ```bash
   npm run build
   npm run start
   ```

## Video Consultations
- Default provider: VDO.Ninja is embedded client-side via iframe.
- Alternate provider: Jitsi Meet using `https://meet.jit.si/external_api.js`.
- Entry points:
  - Patient: Dashboard → Consultations → Join (`provider=vdo` by default)
  - Doctor: Doctor Dashboard → Consultations → Start (`provider=vdo`)
- You can switch provider by adding `provider=jitsi` in the consultation URL, e.g.:
  - `/student/consultation?room=<code>&role=user&provider=jitsi`

## API Routes
Key endpoints under `app/api/`:
- `login` and `logout` for auth
- `signup` for patient registration (sends welcome email)
- `appointments` for scheduling and listing
- `consultations` for online session metadata
- `doctor` and `doctors` for doctor data
- `patients/[id]` for patient detail
- `medical-records` for records
- `inventory` for medicines
- `notifications` for user notifications
- `feedback` to submit session feedback
- `me` to fetch current user profile

## Project Structure
- `app/` Next.js App Router pages and components
- `app/components/` shared UI (topbars, sidebars, sections)
- `app/api/` route handlers (server)
- `lib/` utilities (`mongodb.js`, `auth.js`)
- `models/` Mongoose schemas (`User`, `Appointment`, `Medicine`, `Notification`)
- `app/globals.css` Tailwind v4 styles

## Configuration Notes
- JWT is set as an HttpOnly, `SameSite=strict` cookie; set `JWT_SECRET` in production
- Gmail requires an app password for `EMAIL_PASS` if 2FA is enabled
- `MONGODB_URI` must be provided at runtime; the app will throw if missing
- Set `NEXT_PUBLIC_APP_URL` to your deployed URL for correct links in emails

## Deployment
- Any Node.js host: build with `npm run build` and serve with `npm run start`
- Ensure environment variables are configured on the host
- Use HTTPS in production for secure cookies and camera/microphone permissions

## Troubleshooting
- Missing `MONGODB_URI`: the server will crash on startup; add to `.env`
- Email errors: verify Gmail app password and allow SMTP; check `EMAIL_USER`/`EMAIL_PASS`
- Video calls blocked: browsers require HTTPS and user permissions for camera/mic
- JWT issues: check cookie domain/secure flags and `JWT_SECRET` consistency

## License
- Proprietary or TBD. Add a license if needed.
