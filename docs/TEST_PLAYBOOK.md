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
- Admin-Seed:
  Erwartung: Demo-User "demo.trainer@example.com" hat `isSystemAdmin = true`
  (z. B. in Prisma Studio pruefen).
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

- Admin-Invite (E-Mail + Link):
  - Als Demo-Admin einloggen.
  - Invite an Test-E-Mail schicken.
  - Erwartung:
    - Dashboard zeigt nach dem Invite einen kopierbaren Einladungslink.
    - Link `/join/{token}` funktioniert:
      - Ohne Login -> Login / Set-Password -> Dashboard.
    - Nach Klick auf "Link kopieren" erscheint kurz "Link kopiert".

## Smoke Tests (Phase 3 – Passwort-Login)
- Auf `/auth/login` gibt es keine Magic-Link-Funktionalitaet mehr (nur E-Mail + Passwort).
- Demo-Admin-Login:
  - Seed ausfuehren: `npm run prisma:seed`
  - Auf `/auth/login` mit
    - E-Mail: demo.trainer@example.com
    - Passwort: Demo1234!
  - Erwartung: Redirect auf `/dashboard` (User ist System-Admin).

## Smoke Tests (Phase 3 – Passwort setzen)
- User ohne `passwordHash` anlegen (z. B. via Prisma Studio).
- Einloggen / Session erhalten (z. B. ueber Magic-Link-Invite).
- Erwartung:
  - Aufruf von `/dashboard` -> Redirect auf `/auth/set-password`.
  - Auf `/auth/set-password` Passwort und Bestaetigung eingeben -> Redirect auf `/dashboard`.

## Smoke Tests (Phase 3 – System-Admin)
- Mit Demo-Admin-User einloggen:
  - Team erstellen -> erfolgreich.
  - Invite fuer ein Team verschicken -> erfolgreich.
- Mit normalem User (isSystemAdmin = false) einloggen:
  - Versuchen, Team zu erstellen (z. B. direkt Action ausloesen).
  - Erwartung: Aktion wirft Fehler ("Not allowed") / UI zeigt Fehlermeldung.

## E2E Magic-Link (Resend)
1. Dev-Server laeuft: `npm run dev`.
   Erwartung: Invite-Flow ist verfuegbar.
2. Invite im Dashboard ausloesen und die Magic-Link-Mail pruefen.
   Erwartung: Mail enthaelt einen gueltigen Magic-Link.
3. Magic-Link oeffnen.
   Erwartung: Link ist gueltig, keine Fehlermeldung.
4. Nach dem Klick wird auf `/dashboard` umgeleitet.
   Erwartung: Dashboard laedt, Rolle und Team sind sichtbar (Account-Box).
5. Logout-Button klicken.
   Erwartung: Session-Cookie wird geloescht und Redirect zu `/auth/login`.
