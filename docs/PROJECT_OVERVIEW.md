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
