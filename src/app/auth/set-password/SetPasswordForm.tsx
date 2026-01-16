"use client";

import { useActionState } from "react";

import { Button } from "@/components/Button";

type ActionState = { ok: boolean; error?: string };

type SetPasswordFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function SetPasswordForm({ action }: SetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(action, { ok: true });

  return (
    <form className="form" action={formAction}>
      <label className="stack" htmlFor="password">
        <span>Passwort</span>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mindestens 8 Zeichen"
        />
      </label>
      <label className="stack" htmlFor="passwordConfirm">
        <span>Passwort bestaetigen</span>
        <input
          className="input"
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          placeholder="Passwort wiederholen"
        />
      </label>
      <Button type="submit" disabled={pending}>
        Passwort speichern
      </Button>
      {!state.ok ? <p className="subtitle">{state.error}</p> : null}
    </form>
  );
}
