import bcrypt from "bcryptjs";

const PASSWORD_MIN_LENGTH = 8; // zentraler Wert, kann spaeter noch per Env konfigurierbar werden

export function validatePasswordPolicy(
  plain: string
): { ok: boolean; error?: string } {
  if (!plain || plain.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`,
    };
  }
  return { ok: true };
}

export async function hashPassword(plain: string): Promise<string> {
  const policy = validatePasswordPolicy(plain);
  if (!policy.ok) {
    throw new Error(policy.error ?? "Ungueltiges Passwort.");
  }

  const saltRounds = 10; // ausreichend fuer unsere App, ohne Vercel zu sehr zu stressen
  const hash = await bcrypt.hash(plain, saltRounds);
  return hash;
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  // Keine Policy-Pruefung hier – wichtig ist nur, ob es zum gespeicherten Hash passt
  return bcrypt.compare(plain, hash);
}

// Nur Beispiel / Kommentar, nicht im Produktivcode aufrufen:
// async function demo() {
//   const plain = "test1234";
//   const hash = await hashPassword(plain);
//   const ok = await verifyPassword(plain, hash);
//   console.log({ hash, ok });
// }
