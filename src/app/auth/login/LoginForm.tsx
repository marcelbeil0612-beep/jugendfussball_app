"use client";

import { useActionState } from "react";

import { Button } from "@/components/Button";

type ActionState = { ok: boolean; error?: string };

type LoginFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, { ok: true });

  return (
    <form className="form" action={formAction}>
      <label className="stack" htmlFor="email">
        <span>E-Mail</span>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@verein.de"
        />
      </label>
      <label className="stack" htmlFor="password">
        <span>Passwort</span>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      <Button type="submit" disabled={pending}>
        Einloggen
      </Button>
      {!state.ok ? <p className="subtitle">{state.error}</p> : null}
    </form>
  );
}
