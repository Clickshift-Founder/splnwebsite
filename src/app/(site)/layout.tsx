import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getMember } from "@/lib/auth";
import { getCountries } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [member, countries] = await Promise.all([getMember(), getCountries()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:font-bold">
        Skip to content
      </a>
      <SiteHeader
        member={member ? { slug: member.slug, fullName: member.fullName } : null}
        admissions={countries.filter((c) => c.admissionsOpen).map((c) => ({ code: c.code, flag: c.flag, name: c.name }))}
      />
      <main id="main">{children}</main>
      <SiteFooter countries={countries} />
    </>
  );
}
