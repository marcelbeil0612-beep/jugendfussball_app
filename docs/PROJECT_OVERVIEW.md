# Projektueberblick

## Ziel
Phase 0 liefert eine stabile Foundation fuer die Jugendfussball Team-App:
Auth per Magic-Link (Resend), Rollenmodell, Prisma + Neon Postgres, minimales UI.

## Scope (Phase 0)
- Next.js App Router + TypeScript
- Prisma Schema + Migration
- Magic-Link Login + Session (DB) mit Mail-Versand via Resend API
- Rollenmodell server-seitig enforced
- Rollenbasiertes, minimales Dashboard
- Docs unter /docs

## Prisma Engine
Wir nutzen keine Driver Adapters oder Accelerate. Prisma laeuft im Node-Modus
mit Binary-Engine.

## Deployment
- Vercel Deployment ist die Live-Umgebung (kein Edge-Auth, Node-Runtime)

## Definition of Done (Phase 0)
- Login per Magic-Link funktioniert und erzeugt Session
- Rollen werden server-seitig geprueft
- Dashboard zeigt Rollen-Placeholder
- Lint laeuft, Prisma generate verfuegbar
- Deployment auf Vercel laeuft stabil mit Neon Postgres

## Phase 1: Teams & Membership
- Datenmodell: Team + TeamMember (Join) + User.activeTeamId
- Rollen liegen jetzt teambezogen in TeamMember.role
- Seed erzeugt Demo-Team "SV Steinheim U13", Demo-User und Membership
- Dashboard zeigt Teamname + Rolle aus aktivem Teamkontext
- Team-Zuordnung laeuft ausschliesslich ueber TeamMember (keine direkte Team.users Relation mehr)
- Active-Team-Relation ist explizit: User.activeTeam @relation("ActiveTeam") + Team.activeUsers
- Implizite Join-Tabelle _TeamToUser wurde entfernt (Schema-Cleanup)

## Phase 2: Team-Beitritt
- Einladung per E-Mail (Token-Link)
- Rolle wird vom TRAINER festgelegt
- Login via Magic-Link
- TeamMember + activeTeamId werden gesetzt

## Phase 3 – Passwort-Auth (in Arbeit)
- `User.passwordHash` fuer kuenftiges Login-Formular (E-Mail + Passwort)
- `User.isSystemAdmin` als System-Admin-Flag
- Login erfolgt ausschliesslich ueber E-Mail + Passwort (`/auth/login`)
- Magic-Link wird nur noch fuer Registrierung/Invites genutzt (kein normaler Login)
- Einladungen: Admin erzeugt Invite, System verschickt E-Mail und zeigt den gleichen Join-Link im Dashboard (z. B. fuer WhatsApp)
- Im Dashboard sieht nur der System-Admin den Einladungsbereich (Admin-Tool)
- Dev/Stage: Demo-Admin `demo.trainer@example.com` mit Startpasswort (siehe TEST_PLAYBOOK)
- Neue Pflicht: User ohne Passwort werden auf `/auth/set-password` umgeleitet
- Invite/Registrierung fuehrt nach Session auf `/auth/set-password`
- System-Admin-Gates: Team-Erstellung, Invites und Rollenverwaltung nur mit `isSystemAdmin`
- Phase 4: TRAINER duerfen fuer ihr Team Einladungen verschicken (TeamMember.role)
