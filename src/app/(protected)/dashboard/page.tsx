import { Role } from "@prisma/client";

import { Card } from "@/components/Card";
import { requireAuth } from "@/lib/guards";

export const runtime = "nodejs";

type CardItem = {
  title: string;
  description: string;
};

const trainerCards: CardItem[] = [
  { title: "Termine", description: "Coming soon" },
  { title: "Zusagen", description: "Coming soon" },
  { title: "Fahrdienst", description: "Coming soon" },
  { title: "Kommunikation", description: "Coming soon" },
  { title: "Team", description: "Coming soon" },
  { title: "Training", description: "Coming soon" },
  { title: "Spiel", description: "Coming soon" },
  { title: "CoachGPT", description: "Coming soon" },
];

const parentCards: CardItem[] = [
  { title: "Termine", description: "Coming soon" },
  { title: "Fahrdienst", description: "Coming soon" },
  { title: "Ankuendigungen", description: "Coming soon" },
];

const playerCards: CardItem[] = [
  { title: "Termine", description: "Coming soon" },
];

const roleCards: Record<Role, CardItem[]> = {
  TRAINER: trainerCards,
  COACH: trainerCards,
  MANAGER: trainerCards,
  PARENT: parentCards,
  PLAYER: playerCards,
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const cards = roleCards[user.role] ?? [];

  return (
    <div className="page">
      <main className="container stack">
        <div className="toolbar">
          <div className="stack">
            <span className="pill">Rolle: {user.role}</span>
            <h1>Dashboard</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="button button--secondary" type="submit">
              Logout
            </button>
          </form>
        </div>
        <p className="subtitle">
          Dein rollenbasiertes Dashboard ist vorbereitet. Inhalte folgen.
        </p>
        <Card title="Account">
          <div className="stack">
            <p className="subtitle">E-Mail: {user.email}</p>
            <p className="subtitle">Rolle: {user.role}</p>
            <p className="subtitle">
              Team: {user.team?.name ?? "Nicht zugeordnet"}
            </p>
          </div>
        </Card>
        <div className="grid">
          {cards.map((card) => (
            <Card
              key={card.title}
              title={card.title}
              description={card.description}
              disabled
            />
          ))}
        </div>
      </main>
    </div>
  );
}
