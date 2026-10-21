"use client";

import { useFormAction } from "@/components/ui/form";
import { Mail, KeyRound, Loader2, AlertCircle, Info } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { requestCode, verifyCode, type ClaimState } from "./actions";

export function ClaimForm({ profile, next }: { profile?: string; next?: string }) {
  const { state: emailState, onSubmit: sendAction, pending: sending } = useFormAction<ClaimState>(requestCode, { step: "email" });
  const { state: codeState, onSubmit: verifyAction, pending: verifying } = useFormAction<ClaimState>(verifyCode, { step: "email" });

  // Once a code has been sent, show the code step (verify errors take precedence).
  const codeStep = codeState.step === "code" ? codeState : emailState.step === "code" ? emailState : null;

  if (codeStep) {
    return (
      <form onSubmit={verifyAction} className="space-y-5">
        <input type="hidden" name="email" value={codeStep.email} />
        <input type="hidden" name="next" value={next ?? ""} />
        <div className="rounded-[8px] bg-green-tint p-4 text-sm text-green-deep">
          We sent a 6-digit code to <strong>{codeStep.masked}</strong>. It expires in 15 minutes.
        </div>
        {codeStep.devNote && (
          <p className="flex items-center gap-2 rounded-[8px] bg-amber-tint p-3 text-sm text-[#7a4f00]">
            <Info className="size-4 shrink-0" /> {codeStep.devNote}
          </p>
        )}
        <div>
          <label htmlFor="code" className="mb-2 block text-sm font-bold">
            Verification code
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate" />
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              className="h-14 w-full rounded-[8px] border border-line bg-white pl-12 pr-4 text-2xl font-extrabold tracking-[0.4em] outline-none focus:border-green"
            />
          </div>
        </div>
        {codeState.step === "code" && codeState.error && <ErrorNote>{codeState.error}</ErrorNote>}
        <button type="submit" disabled={verifying} className={buttonClass("primary", "lg", "w-full")}>
          {verifying ? <Loader2 className="size-5 animate-spin" /> : null}
          Verify &amp; continue
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full text-center text-sm font-bold text-slate hover:text-ink"
        >
          Use a different email or resend
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendAction} className="space-y-5">
      <input type="hidden" name="profile" value={profile ?? ""} />
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold">
          {profile ? "The email address SPPG holds for this profile" : "Your registered email address"}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            placeholder="you@example.com"
            className="h-14 w-full rounded-[8px] border border-line bg-white pl-12 pr-4 text-lg outline-none focus:border-green"
          />
        </div>
      </div>
      {emailState.step === "email" && emailState.error && <ErrorNote>{emailState.error}</ErrorNote>}
      {codeState.step === "email" && codeState.error && <ErrorNote>{codeState.error}</ErrorNote>}
      <button type="submit" disabled={sending} className={buttonClass("primary", "lg", "w-full")}>
        {sending ? <Loader2 className="size-5 animate-spin" /> : null}
        Send me a code
      </button>
    </form>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex gap-2 rounded-[8px] bg-red-tint p-3 text-sm font-semibold text-red">
      <AlertCircle className="mt-0.5 size-4 shrink-0" /> {children}
    </p>
  );
}
