# Rollenmodell

## System-Ebene
- `isSystemAdmin`: boolean auf User-Ebene
- Nur System-Admin darf Teams erstellen
- Nur System-Admin darf Einladungen verschicken
- Nur System-Admin darf Rollen/Members verwalten
- Team-Rollen (TRAINER / PARENT / PLAYER / …) bleiben wie beschrieben als `TeamMember.role`

## Rollen
- TRAINER: Vollzugriff auf teambezogene Organisation (Termine, Training, Spiel), darf Mitglieder einladen (PARENT / PLAYER)
- COACH: Trainer-aehnlich, operativ
- MANAGER: Organisation + Kommunikation
- PARENT: Elternsicht (Termine, Fahrdienst, Ankuendigungen)
- PLAYER: Spielersicht (Termine)

## Server-seitige Durchsetzung
- Session wird server-seitig validiert
- Zugriff auf geschuetzte Bereiche nur mit gueltiger Session
- Rollenpruefung via `requireRole([...])` in Server Components/Routes
- Auth- und Session-Logik laeuft im Node-Runtime-Kontext (kein Edge)
