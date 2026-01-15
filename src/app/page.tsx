export default function Home() {
  return (
    <div className="page">
      <main className="container stack">
        <div className="hero">
          <span className="pill">Phase 0</span>
          <h1>Jugendfussball Team-App</h1>
          <p className="subtitle">
            Fokus auf Team-Kommunikation, Termine und Rollenklarheit. Aktuell
            befindet sich die App im Foundation-Setup.
          </p>
          <div>
            <a className="button button--primary" href="/auth/login">
              Zum Login
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
