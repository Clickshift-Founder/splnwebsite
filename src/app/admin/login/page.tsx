import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { FrameEdge } from "@/components/ui/primitives";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grain relative grid min-h-dvh place-items-center overflow-hidden bg-night px-5 py-16">
      <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-green/20 blur-[120px]" aria-hidden />
      <div className="relative w-full max-w-md overflow-hidden rounded-[16px] bg-white shadow-2xl">
        <FrameEdge />
        <div className="p-8">
          <Image src="/brand/spln-logo.png" alt="SPPG Public Leaders Network" width={300} height={37} className="h-auto w-[240px]" priority />
          <h1 className="mt-8 text-2xl font-extrabold">Directors&apos; console</h1>
          <p className="mt-1 text-slate">Sign in to manage graduates, numbers, Spotlight and Insights.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
