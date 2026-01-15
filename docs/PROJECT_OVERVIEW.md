# Projektueberblick

## Ziel
Phase 0 liefert eine stabile Foundation fuer die Jugendfussball Team-App:
Auth per Magic-Link, Rollenmodell, Prisma + Neon Postgres, minimal UI.

## Scope (Phase 0)
- Next.js App Router + TypeScript
- Prisma Schema + Migration
- Magic-Link Login + Session (DB)
- Rollenmodell server-seitig enforced
- Rollenbasiertes, minimales Dashboard
- Docs unter /docs

## Prisma Engine
Wir nutzen keine Driver Adapters oder Accelerate. Prisma laeuft im Node-Modus
mit Binary-Engine.

## Definition of Done (Phase 0)
- Login per Magic-Link funktioniert und erzeugt Session
- Rollen werden server-seitig geprueft
- Dashboard zeigt Rollen-Placeholder
- Lint laeuft, Prisma generate verfuegbar
- Deployment auf Vercel ohne lokale Hacks
