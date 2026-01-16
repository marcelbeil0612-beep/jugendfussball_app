# Rollenmodell

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
