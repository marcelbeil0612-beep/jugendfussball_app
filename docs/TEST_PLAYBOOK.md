# Test Playbook (Phase 0)

## Lokal
1. ENV Variablen setzen (.env.local aus .env.example)
2. `Remove-Item Env:PRISMA_CLIENT_ENGINE_TYPE -ErrorAction SilentlyContinue`
3. `npm install`
4. `Remove-Item Env:PRISMA_CLIENT_ENGINE_TYPE -ErrorAction SilentlyContinue`
5. `npx prisma generate`
6. `npx prisma migrate dev`
7. `npm run dev`

## Smoke Tests
- /auth/login oeffnet sich und akzeptiert E-Mail
- Magic-Link Mail wird gesendet
- Magic-Link verifiziert und leitet zu /dashboard
- Dashboard zeigt Karten entsprechend der Rolle
