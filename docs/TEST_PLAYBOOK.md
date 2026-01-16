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

## E2E Magic-Link (real SMTP)
1. Dev-Server laeuft: `npm run dev`.
   Erwartung: `/auth/login` laedt ohne Fehler.
2. `http://localhost:3000/auth/login` oeffnen und die SMTP-aktive Test-Adresse
   eingeben (z.B. `marcelbeil@gmx.de`), Formular absenden.
   Erwartung: Seite zeigt den Hinweis "Wenn die E-Mail existiert, ist der Magic-Link unterwegs."
3. Postfach der Test-Adresse pruefen und den Magic-Link oeffnen.
   Erwartung: Link ist gueltig, keine Fehlermeldung.
4. Nach dem Klick wird auf `/dashboard` umgeleitet.
   Erwartung: Dashboard laedt, Rolle und Team sind sichtbar (Account-Box).
5. Logout-Button klicken.
   Erwartung: Session-Cookie wird geloescht und Redirect zu `/auth/login`.
