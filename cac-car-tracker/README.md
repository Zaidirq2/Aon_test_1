# CAC Car Tracker — MVP demo

A small, phone-first web app for **CAC – Complete Auto Care (Karrada, Baghdad)**.
Customers follow the progress of their car while it is in the center through a private link
shared on WhatsApp. Staff update the stage from a simple dashboard. No customer login.

| Customer page `/t/<token>` | Staff dashboard `/admin` |
| --- | --- |
| Arabic by default (RTL), English toggle | Shared password login |
| Car, service, current stage, 7-step timeline | Active jobs with stage at a glance |
| Workshop photos, estimated ready time, last update | Create job, one-tap stage update, note + photo |
| Auto-refreshes every 30 s | "Send link via WhatsApp" button, mark as delivered |
| Call / WhatsApp buttons, working hours | Arabic / English toggle |

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- SQLite via Prisma 6 (zero setup, one file in `prisma/dev.db`)
- Photos stored locally in `data/uploads/` and served through `/api/photos/<file>`
- Cairo font (Arabic + Latin), `dir="rtl"` handled at the page level

## Setup

Requirements: Node.js 20 or newer.

```bash
cd cac-car-tracker
npm install
cp .env.example .env        # then edit the values (see below)
npx prisma migrate dev      # creates prisma/dev.db and the tables
npx prisma db seed          # 3 demo jobs at different stages
npm run dev                 # http://localhost:3000
```

`npm run setup` runs the migration and the seed in one go.

### Environment variables (`.env`)

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLite file, relative to `prisma/` | `file:./dev.db` |
| `ADMIN_PASSWORD` | Shared staff password for `/admin` | `cac2024` |
| `SESSION_SECRET` | Signs the admin cookie | any long random string |
| `NEXT_PUBLIC_BASE_URL` | Base of the tracking links sent to customers | `http://192.168.1.20:3000` |
| `NEXT_PUBLIC_CAC_PHONE` | Phone / WhatsApp number shown in the footer | `+9647700000000` |

For a demo on a phone, set `NEXT_PUBLIC_BASE_URL` to your laptop's LAN IP (or a tunnel such as
ngrok) so the WhatsApp link opens on the customer's phone. Restart `npm run dev` after changing it.

### Demo links after seeding

| Car | Stage | Link |
| --- | --- | --- |
| Toyota Land Cruiser 2023 | Protection (PPF) | `/t/demo-ahmed` |
| Mercedes-Benz C200 2022 | Inspection | `/t/demo-sara` |
| BMW X5 2021 | Ready for pickup | `/t/demo-mustafa` |

Re-run `npx prisma db seed` at any time to reset the demo data (it deletes all jobs first).

## 3-minute demo script

1. **Dashboard (30 s).** Open `/admin` on the laptop, sign in with the password. Show the three
   cars in the center and their stages.
2. **Create a job (45 s).** Tap **+ سيارة جديدة**. Enter the manager's name and phone, their car,
   the service (e.g. كوتنج سيراميك) and an estimated ready time. Tap **إنشاء وفتح**.
3. **Send the link (30 s).** Tap **إرسال الرابط عبر واتساب**. WhatsApp opens with a ready Arabic
   message containing the private link. Send it to the manager's phone (or use **نسخ الرابط**).
4. **Customer view (30 s).** On the phone, open the link. Point out: Arabic by default, the car,
   the timeline, the estimated time, the call/WhatsApp buttons. Tap **English** to show the toggle.
5. **Update the stage (45 s).** Back on the laptop, tap **3. الغسيل**, write a short note, take a
   photo with the laptop or upload one, tap **حفظ التحديث**. Within 30 seconds the phone updates on
   its own: new stage, progress bar, photo and note.
6. **Deliver (15 s).** Tap **تم التسليم**. The phone now shows "تم تسليم السيارة" with a thank-you.

## Project structure

```
cac-car-tracker/
├─ prisma/
│  ├─ schema.prisma          # Job + StageUpdate models (SQLite)
│  └─ seed.mjs               # 3 demo jobs
├─ data/uploads/             # uploaded photos (git-ignored)
└─ src/
   ├─ lib/
   │  ├─ stages.ts           # the 7 stages, Arabic + English — edit here to reconfigure
   │  ├─ i18n.ts             # UI strings (ar/en) and CAC contact details
   │  ├─ auth.ts             # shared-password session cookie
   │  ├─ format.ts           # Baghdad-time formatting, WhatsApp link builder
   │  ├─ jobs.ts             # data shape sent to the customer page
   │  ├─ uploads.ts          # photo storage
   │  └─ db.ts               # Prisma client
   ├─ components/
   │  ├─ Tracker.tsx         # customer page (client, auto-refresh, language toggle)
   │  └─ admin/              # login, new job, stage update forms
   └─ app/
      ├─ t/[token]/          # customer page
      ├─ api/track/[token]/  # JSON used by the 30 s refresh
      ├─ api/photos/[file]/  # serves uploaded photos
      └─ admin/              # dashboard, job pages, server actions
```

Changing the stages: edit `src/lib/stages.ts`. The customer timeline, the admin buttons and the
seed all read from that list.

## Phase 2 (not in this MVP)

- **Odoo integration**: read/write jobs and customers through Odoo JSON-RPC so the tracker fits
  CAC's existing system (the website already runs on Odoo).
- **Digital warranty certificate** with QR code, plus maintenance reminders for coatings and PPF.
- **Price estimator and online booking.**
- **Push notifications / WhatsApp Business API** to send updates automatically instead of the
  manual `wa.me` link.
- Multi-user staff accounts, cloud storage for photos, and a hosted database.

## Notes for production

This is a demo. Before real use: put it behind HTTPS, use a strong `ADMIN_PASSWORD` and
`SESSION_SECRET`, move photos to object storage, and add a hosted database (Postgres works with the
same Prisma schema).
