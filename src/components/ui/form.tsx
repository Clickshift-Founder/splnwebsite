"use client";

import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { buttonClass } from "./primitives";
import { cn } from "@/lib/brand";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> } | null;

/**
 * Like useActionState, but submits via onSubmit so React 19 does NOT reset the form
 * afterwards — a validation error must never wipe what someone typed. Includes the
 * clicked submit button's name/value (e.g. intent=draft|submit).
 */
export function useFormAction<S>(fn: (prev: Awaited<S>, fd: FormData) => Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState<S, FormData>(fn, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const fd = new FormData(e.currentTarget, submitter ?? undefined);
    startTransition(() => dispatch(fd));
  };
  return { state, onSubmit, pending };
}

const inputBase =
  "w-full rounded-[6px] border border-line bg-white px-3.5 text-[0.98rem] outline-none transition-colors placeholder:text-slate/55 focus:border-green focus:ring-2 focus:ring-green/15";

export function Field({
  label,
  name,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  name: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold">
        {label} {required && <span className="text-red">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs leading-relaxed text-slate">{hint}</p>}
      {error && <p className="mt-1.5 text-sm font-semibold text-red">{error}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input id={props.name} {...props} className={cn(inputBase, "h-11", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea id={props.name} {...props} className={cn(inputBase, "py-3 leading-relaxed", props.className)} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select id={props.name} {...props} className={cn(inputBase, "h-11 pr-8", props.className)}>
      {children}
    </select>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  className,
  name,
  value,
  pending: pendingProp,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  name?: string;
  value?: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={buttonClass(variant, "md", className)}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionResult }) {
  if (!state) return null;
  if (state.ok)
    return (
      <p role="status" className="flex items-center gap-2 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">
        <CheckCircle2 className="size-4" /> {state.message ?? "Saved."}
      </p>
    );
  return (
    <p role="alert" className="flex items-center gap-2 rounded-[8px] bg-red-tint px-4 py-3 text-sm font-bold text-red">
      <AlertCircle className="size-4" /> {state.error}
    </p>
  );
}
