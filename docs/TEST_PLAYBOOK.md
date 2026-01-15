# Test Playbook (Phase 0)

## Lokal
1. ENV Variablen setzen (.env.local aus .env.example)
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev`

## Smoke Tests
- /auth/login oeffnet sich und akzeptiert E-Mail
- Magic-Link Mail wird gesendet
- Magic-Link verifiziert und leitet zu /dashboard
- Dashboard zeigt Karten entsprechend der Rolle
