# MagnetPay Admin

Staff web portal for MagnetPay — users, KYC/KYB, wallets, transfers, marketplace, escrow, logistics, compliance, and ops.

**Repository:** [github.com/hafizsameer11/magnetpayadmin](https://github.com/hafizsameer11/magnetpayadmin)

**Stack:** Vite + React + TanStack Router + Tailwind

## Quick start (local)

Requires [MagnetPay API](https://github.com/hafizsameer11/magnet-pay-backend) running.

```bash
git clone https://github.com/hafizsameer11/magnetpayadmin.git
cd magnetpayadmin
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL. Local: `http://127.0.0.1:4000`. Production: `https://magnetpay.amctraders.online` |

## Admin login (after API seed)

| Phone | Passcode |
|-------|----------|
| `+2348000000001` | `123456` |

Or email field on login maps to the admin phone above.

## Production deploy

Static build served behind HTTPS (Vercel, Netlify, nginx, Cloudflare Pages):

```bash
npm run build
# output in dist/
```

Set build env:

```
VITE_API_URL=https://magnetpay.amctraders.online
```

**Live API:** [magnetpay.amctraders.online/health](https://magnetpay.amctraders.online/health)

Point your host at `dist/` and enable SPA fallback to `index.html` for client routes.

### Example: Vercel

1. Import repo `hafizsameer11/magnetpayadmin`
2. Framework: Vite
3. Environment: `VITE_API_URL=https://magnetpay.amctraders.online`
4. Deploy

## Git workflow

```bash
git add .
git commit -m "Describe change"
git push origin main
```

Never commit `.env` — only `.env.example`.

## API integration

Wired screens use `src/lib/api.ts` against `/admin/*` on the backend. They show **live data or honest empty states** — no hardcoded demo fixtures.

The sidebar lists **~22 production-ready areas** (users, KYC/KYB, orders, wallets, escrow, etc.). Additional route files exist as placeholders for future backend APIs; they are not linked in the nav.

Key areas: dashboard, users, KYC/KYB, wallets, transactions, deposits, withdrawals, orders, listings, escrow, disputes, shipments, FX, fees, ledger, audit, chats, announcements.

## Project layout

```
magnetpay-admin/
├── src/
│   ├── routes/       # TanStack file routes (~160 admin screens)
│   ├── components/   # AdminShell, shared UI
│   └── lib/api.ts    # Typed admin API client
├── scripts/          # Route checks, codemods
└── .env.example
```

## Related repos

- **API:** https://github.com/hafizsameer11/magnet-pay-backend
- **Mobile:** (Expo app — separate repo)

---

<details>
<summary>Original Lovable / PRD notes</summary>

This project was initially scaffolded with [Lovable](https://lovable.dev). The PRD inventory below describes the full product vision; the admin panel implements the **Admin Web Portal** section against the live MagnetPay API.

See original PRD screen list in git history / Lovable project.

</details>
