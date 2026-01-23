const ageBadges = [
  "G-Jugend",
  "F-Jugend",
  "E-Jugend",
  "D-Jugend",
  "C-Jugend",
  "B-Jugend",
  "A-Jugend",
];

const features = [
  {
    icon: "📣",
    title: "Team-Kommunikation",
    text: "Kurze Infos zu Training, Treffpunkt und Aenderungen.",
  },
  {
    icon: "📅",
    title: "Termine & Spiele",
    text: "Alle Trainings, Spiele und Turniere an einem Ort.",
  },
  {
    icon: "👥",
    title: "Kader & Rollen",
    text: "Spieler, Eltern, Trainer – klar organisiert und sichtbar.",
  },
  {
    icon: "✅",
    title: "Anwesenheit & Zu-/Absagen",
    text: "Wer ist dabei? Wer fehlt? Schnell und uebersichtlich.",
  },
  {
    icon: "✉️",
    title: "Einladungen per E-Mail",
    text: "Eltern und Spieler in Sekunden ins Team holen.",
  },
];

const steps = [
  {
    title: "Zugang anfragen",
    text: "Kontaktiere den Jugendleiter und erhalte euren Team-Start.",
  },
  {
    title: "Team anlegen",
    text: "Trainer richten die Mannschaft ein und laden Betreuer ein.",
  },
  {
    title: "Spieler & Eltern einladen",
    text: "Einladungslinks versenden und gemeinsam testen.",
  },
];

const faqs = [
  {
    question: "Kostet die App etwas?",
    answer: "Nein, die Beta ist fuer SV Steinheim Teams aktuell kostenlos.",
  },
  {
    question: "Wer bekommt einen Zugang?",
    answer:
      "Trainer, Betreuer sowie Eltern und Spieler, die vom Team eingeladen werden.",
  },
  {
    question: "Brauchen Spieler ein eigenes Smartphone?",
    answer:
      "Nicht zwingend. Eltern koennen die Termine und Rueckmeldungen auch fuer ihre Kinder verwalten.",
  },
  {
    question: "Wie sicher sind unsere Daten?",
    answer:
      "Die Daten bleiben vereinsintern, wir nutzen moderne Standards und pruefen alles Schritt fuer Schritt.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-white py-2">
        <p className="mx-auto max-w-6xl px-4 text-center text-sm text-emerald-900">
          Beta-Phase – Exklusiv fuer die Jugendmannschaften des SV Steinheim
        </p>
      </div>

      <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold text-emerald-800 sm:text-base">
            SV Steinheim – Jugend-App
          </span>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-emerald-700" href="#zielgruppen">
              Fuer wen?
            </a>
            <a className="hover:text-emerald-700" href="#funktionen">
              Funktionen
            </a>
            <a className="hover:text-emerald-700" href="#start">
              So startet ihr
            </a>
          </nav>
          <a
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            href="/auth/login"
          >
            Zum Login
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-20 pt-12">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Beta fuer SV Steinheim
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Die Team-App fuer die Jugend des SV Steinheim
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              Von der G-Jugend bis zur A-Jugend – Kommunikation, Termine und
              Team-Organisation an einem Ort.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                className="w-full rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:bg-emerald-700 sm:w-auto"
                href="#start"
              >
                Jetzt als Team testen
              </a>
              <a
                className="w-full rounded-full border border-emerald-200 bg-white px-6 py-3 text-center text-sm font-semibold text-emerald-700 hover:border-emerald-400 sm:w-auto"
                href="/auth/login"
              >
                Zum Login
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-700">
                  Team-Dashboard
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                  SV Steinheim U15
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700">
                    Naechstes Training
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    Dienstag, 17:30 Uhr
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    Spieltag
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    Samstag, 11:00 Uhr
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-emerald-200 p-4 text-sm text-emerald-700">
                  Einladungen laufen · 12 Spieler:innen aktiv
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow">
              <p className="text-sm font-semibold text-slate-700">
                Termine & Zu-/Absagen
              </p>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">Training</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    9 Zusagen
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">Spieltag</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    12 Zusagen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="zielgruppen" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Fuer alle Jugendteams des SV Steinheim
            </h2>
            <p className="text-slate-600">
              Trainer:innen und Betreuer:innen organisieren hier ihre Teams –
              aktuell exklusiv fuer SV Steinheim, ideal zum gemeinsamen Testen.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ageBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        <section id="funktionen" className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Alles, was ihr fuer euren Jugendalltag braucht
            </h2>
            <p className="mt-3 text-slate-600">
              Ob Training, Spieltag oder Orga – alles bleibt klar und entspannt.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
              >
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="start" className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              So testet ihr als erstes Team
            </h2>
            <p className="mt-3 text-slate-600">
              Drei kurze Schritte, und euer Team ist startklar.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Schritt {index + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <a
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
              href="mailto:jugendfussball@sv-steinheim.de"
            >
              Kontakt aufnehmen
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-8 text-center">
          <h2 className="text-xl font-semibold text-emerald-900">
            Warum aktuell nur SV Steinheim?
          </h2>
          <p className="mt-3 text-sm text-emerald-800">
            Wir testen die App zuerst intern mit allen Jugendteams, um Funktionen
            im echten Vereinsalltag zu pruefen und zu verbessern.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">FAQ</h2>
            <p className="mt-2 text-slate-600">
              Kurz und knapp beantwortet.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              Ein Projekt aus der Jugendabteilung des SV Steinheim
            </p>
            <p>App befindet sich im Aufbau – Feedback ist ausdruecklich erwuenscht.</p>
          </div>
          <a
            className="font-semibold text-emerald-700 hover:text-emerald-900"
            href="mailto:jugendfussball@sv-steinheim.de"
          >
            jugendfussball@sv-steinheim.de
          </a>
        </div>
      </footer>
    </div>
  );
}
