## MagnetPay Mobile — Home Dashboard Prototype

Starting with the mobile app's Home Dashboard screen. We'll generate distinct rendered design directions you can preview side-by-side, then build the chosen one as a real React route in the project.

### Scope of this step
Only the **Home Dashboard** screen (PRD screen #9):
- Top bar: greeting, avatar, notifications bell
- Multi-currency wallet balance cards (NGN, RMB, USD) with total equivalent
- Quick actions: Fund, Send, Marketplace, Ship
- Active escrows / orders summary strip
- Recent transactions list
- Bottom tab nav placeholder (Home, Wallet, Market, Escrow, Profile)

Mobile viewport only. No auth, wallet detail, marketplace, escrow, or shipping screens yet — those come in later turns.

### Note on "4 versions"
The directions tool renders **3** distinct directions per round (hard limit). I'll generate 3 strong, meaningfully different directions. If none feel right, we run another round for 3 more.

### Direction variance
Each direction commits to a different design system — palette, type pairing, density, and personality — all anchored to the PRD's "dark theme with green/purple accents" as a soft starting point but free to deviate where a stronger identity emerges. Likely axes:
1. **Fintech-trust** — dark, dense, data-forward (think Revolut / Wise)
2. **Trade-confident** — warmer, editorial, brand-led (cross-border merchant feel)
3. **Soft-modern** — light, generous whitespace, friendly (consumer-app feel)

### After you pick
- Lock the chosen direction's tokens (colors, fonts, radius, spacing) into `src/styles.css`
- Build the Home screen as `src/routes/index.tsx` with a mobile-first layout
- Set the preview viewport to mobile
- Static data only — no backend wiring this turn

### Next steps after Home
Once Home is approved, we'll work through the mobile app screen list from the PRD (Auth → Wallet → Marketplace → Escrow → Logistics → Profile), reusing the locked design system. Then PWA, then Admin web portal.
