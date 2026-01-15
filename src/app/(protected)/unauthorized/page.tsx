import { Button } from "@/components/Button";

export default function UnauthorizedPage() {
  return (
    <div className="page">
      <main className="container stack">
        <h1>Kein Zugriff</h1>
        <p className="subtitle">
          Deine Rolle ist fuer diesen Bereich nicht freigeschaltet.
        </p>
        <Button href="/dashboard" variant="secondary">
          Zurueck zum Dashboard
        </Button>
      </main>
    </div>
  );
}
