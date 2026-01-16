# Test Playbook (Phase 0)

## Lokal
1. ENV Variablen setzen (.env.local aus .env.example)
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `DATABASE_URL` (Neon Postgres)
   - `APP_URL=http://localhost:3000`
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev`

## Smoke Tests
- /auth/login oeffnet sich und akzeptiert E-Mail
- Magic-Link Mail wird gesendet
- Magic-Link verifiziert und leitet zu /dashboard
- Dashboard zeigt Karten entsprechend der Rolle

## Smoke Tests (Phase 1 – Teams & Membership)
- Seed laufen lassen: `npm run prisma:seed`
  Erwartung: Demo-Team "SV Steinheim U13", Demo-User "demo.trainer@example.com",
  TeamMember (Role TRAINER) vorhanden.
- Login als Demo-User:
  Erwartung: Dashboard zeigt Teamname "SV Steinheim U13" und Rolle "TRAINER".
- Neuer User via Magic-Link (ohne Team):
  Erwartung: Dashboard zeigt "Team: Nicht zugeordnet" und Rolle "—".
- Regression:
  Erwartung: Login/Logout/Session weiterhin stabil (keine neuen Fehler).

## Smoke Tests (Phase 2 – Team-Invite)
- TRAINER sieht Invite-Box im Dashboard.
- PARENT / PLAYER sehen keine Invite-Box.
- TRAINER kann Invite mit Rolle PARENT oder PLAYER versenden.
- Invite-Mail enthaelt funktionierenden `/join/{token}`-Link.
- Nicht eingeloggter User -> Login -> Join -> Dashboard.
- Invite ist einmalig (zweiter Aufruf zeigt Fehlerseite).
- Invite mit falscher E-Mail -> Fehlerseite.

## E2E Magic-Link (Resend)
1. Dev-Server laeuft: `npm run dev`.
   Erwartung: `/auth/login` laedt ohne Fehler.
2. `http://localhost:3000/auth/login` oeffnen und eine gueltige Adresse
   eingeben, Formular absenden.
   Erwartung: Seite zeigt den Hinweis "Wenn die E-Mail existiert, ist der Magic-Link unterwegs."
3. Postfach der Test-Adresse pruefen (Resend) und den Magic-Link oeffnen.
   Erwartung: Link ist gueltig, keine Fehlermeldung.
4. Nach dem Klick wird auf `/dashboard` umgeleitet.
   Erwartung: Dashboard laedt, Rolle und Team sind sichtbar (Account-Box).
5. Logout-Button klicken.
   Erwartung: Session-Cookie wird geloescht und Redirect zu `/auth/login`.
