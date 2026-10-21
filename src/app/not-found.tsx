import Image from "next/image";
import Link from "next/link";
import { FrameEdge, buttonClass } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <main className="grain relative grid min-h-dvh place-items-center overflow-hidden bg-night px-5 text-center text-white">
      <div className="absolute inset-x-0 top-0">
        <FrameEdge />
      </div>
      <div>
        <Link href="/">
          <Image src="/brand/spln-logo-light.png" alt="SPPG Public Leaders Network" width={260} height={32} className="mx-auto h-auto w-[240px]" />
        </Link>
        <p className="mt-14 text-8xl font-black tracking-tighter text-tile-gradient">404</p>
        <h1 className="mt-4 text-3xl font-extrabold">This page isn&apos;t on the register.</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">It may have moved, or the profile may no longer be public.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass("light")}>
            Go home
          </Link>
          <Link href="/graduates" className={buttonClass("ghost-light")}>
            Search graduates
          </Link>
        </div>
      </div>
    </main>
  );
}
