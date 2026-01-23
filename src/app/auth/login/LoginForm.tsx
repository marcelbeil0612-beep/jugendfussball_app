"use client";

import { useActionState, useState } from "react";

type ActionState = { ok: boolean; error?: string };

type LoginFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, { ok: true });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  const showEmailError = triedSubmit && !email.trim();
  const showPasswordError = triedSubmit && !password.trim();

  return (
    <form
      className="space-y-4"
      action={formAction}
      onSubmit={() => setTriedSubmit(true)}
    >
      {!state.ok ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Login fehlgeschlagen. Bitte E-Mail und Passwort pruefen.
        </div>
      ) : null}
      <label className="block text-sm font-medium text-slate-700" htmlFor="email">
        E-Mail
        <input
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="trainer@sv-steinheim.de"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {showEmailError ? (
          <span className="mt-2 block text-xs text-rose-600">
            Bitte gib deine E-Mail ein.
          </span>
        ) : null}
      </label>
      <label
        className="block text-sm font-medium text-slate-700"
        htmlFor="password"
      >
        Passwort
        <div className="relative mt-2">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? "Verbergen" : "Anzeigen"}
          </button>
        </div>
        {showPasswordError ? (
          <span className="mt-2 block text-xs text-rose-600">
            Bitte gib dein Passwort ein.
          </span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Einloggen..." : "Einloggen"}
      </button>
    </form>
  );
}
