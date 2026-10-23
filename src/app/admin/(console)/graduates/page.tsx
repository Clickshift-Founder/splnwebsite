import Link from "next/link";
import { and, asc, count, eq, ilike, isNotNull, isNull, or, type SQL } from "drizzle-orm";
import { Eye, EyeOff } from "lucide-react";
import { db } from "@/db";
import { cohorts, graduates } from "@/db/schema";
import { AdminHeader, Panel, Table } from "@/components/admin/ui";
import { Avatar, Badge, ButtonLink } from "@/components/ui/primitives";
import { Flag } from "@/components/ui/flag";
import { Input, Select } from "@/components/ui/form";
import { OFFICE_LABEL } from "@/lib/brand";
import { requireAdmin } from "@/lib/auth";
import { getCohorts, getCountries } from "@/lib/queries";
import { setGraduateHidden } from "../../actions";
import { ImportForm } from "./import-form";

const PAGE = 50;
type SP = Promise<{ q?: string; cohort?: string; view?: string; page?: string; deleted?: string }>;

export default async function AdminGraduatesPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: (SQL | undefined)[] = [];
  if (sp.q?.trim())
    for (const w of sp.q.trim().split(/\s+/).slice(0, 4))
      where.push(or(ilike(graduates.fullName, `%${w}%`), ilike(graduates.email, `%${w}%`), ilike(graduates.matricNumber, `%${w}%`)));
  if (sp.cohort) where.push(eq(cohorts.slug, sp.cohort));
  if (sp.view === "hidden") where.push(eq(graduates.isHidden, true));
  if (sp.view === "claimed") where.push(isNotNull(graduates.profileClaimedAt));
  if (sp.view === "noemail") where.push(isNull(graduates.email));
  if (sp.view === "office") where.push(or(eq(graduates.officeStatus, "aspirant"), eq(graduates.officeStatus, "candidate"), eq(graduates.officeStatus, "appointed"), eq(graduates.officeStatus, "elected")));
  const w = and(...where);

  const [rows, [{ total }], allCohorts, allCountries] = await Promise.all([
    db
      .select({
        id: graduates.id,
        slug: graduates.slug,
        fullName: graduates.fullName,
        email: graduates.email,
        photoUrl: graduates.photoUrl,
        isHidden: graduates.isHidden,
        claimed: graduates.profileClaimedAt,
        officeStatus: graduates.officeStatus,
        cohortName: cohorts.name,
        countryCode: cohorts.countryCode,
      })
      .from(graduates)
      .innerJoin(cohorts, eq(graduates.cohortId, cohorts.id))
      .where(w)
      .orderBy(asc(graduates.fullName))
      .limit(PAGE)
      .offset((page - 1) * PAGE),
    db.select({ total: count() }).from(graduates).innerJoin(cohorts, eq(graduates.cohortId, cohorts.id)).where(w),
    getCohorts(),
    getCountries(),
  ]);
  const pages = Math.max(1, Math.ceil(Number(total) / PAGE));
  const qs = (p: number) => `?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.cohort ? { cohort: sp.cohort } : {}), ...(sp.view ? { view: sp.view } : {}), page: String(p) })}`;
  const flag = (code: string) => allCountries.find((c) => c.code === code);

  return (
    <>
      <AdminHeader
        title="Graduates"
        sub="The verified register. Hide a graduate to remove them from the public directory without deleting them."
        actions={<ButtonLink href="/admin/graduates/new" size="sm">Add graduate</ButtonLink>}
      />
      {sp.deleted && <p className="mb-6 rounded-[8px] bg-green-tint px-4 py-3 text-sm font-bold text-green-deep">Graduate deleted.</p>}

      <form className="mb-5 grid gap-3 rounded-[12px] border border-line bg-white p-4 md:grid-cols-[1fr_220px_200px_auto]">
        <Input name="q" defaultValue={sp.q} placeholder="Search name, email or matric number…" />
        <Select name="cohort" defaultValue={sp.cohort ?? ""}>
          <option value="">All classes</option>
          {allCohorts.map((c) => (
            <option key={c.slug} value={c.slug}>
              {flag(c.countryCode)?.name} — {c.name}
            </option>
          ))}
        </Select>
        <Select name="view" defaultValue={sp.view ?? ""}>
          <option value="">Everyone</option>
          <option value="hidden">Hidden only</option>
          <option value="claimed">Claimed profiles</option>
          <option value="office">In public life</option>
          <option value="noemail">No email on file</option>
        </Select>
        <button className="h-11 rounded-[6px] bg-ink px-5 font-bold text-white">Filter</button>
      </form>

      <p className="mb-3 text-sm font-bold text-slate">{Number(total).toLocaleString("en-GB")} graduates</p>
      <Table>
        <thead>
          <tr>
            <th>Graduate</th>
            <th>Class</th>
            <th>Email on file</th>
            <th>Status</th>
            <th className="text-right">Public directory</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <tr key={g.id} className={g.isHidden ? "bg-sand/70" : ""}>
              <td>
                <Link href={`/admin/graduates/${g.id}`} className="flex items-center gap-3 font-bold hover:text-green-deep">
                  <Avatar name={g.fullName} src={g.photoUrl} countryCode={g.countryCode} size={34} />
                  {g.fullName}
                </Link>
              </td>
              <td className="whitespace-nowrap">
                <Flag code={g.countryCode} emoji={flag(g.countryCode)?.flag} /> {g.cohortName}
              </td>
              <td className="max-w-[220px] truncate text-slate">{g.email ?? <Badge accent="red">none</Badge>}</td>
              <td className="space-x-1 whitespace-nowrap">
                {g.claimed && <Badge accent="green">Claimed</Badge>}
                {g.officeStatus !== "none" && <Badge accent="blue">{OFFICE_LABEL[g.officeStatus]}</Badge>}
              </td>
              <td className="text-right">
                <form action={setGraduateHidden} className="inline">
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="hidden" value={g.isHidden ? "0" : "1"} />
                  <button
                    className={
                      g.isHidden
                        ? "inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white"
                        : "inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-bold text-green-deep hover:border-red hover:text-red"
                    }
                    title={g.isHidden ? "Hidden — click to show publicly" : "Visible — click to hide"}
                  >
                    {g.isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {g.isHidden ? "Hidden" : "Visible"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm font-bold">
          {page > 1 ? <Link href={qs(page - 1)}>← Previous</Link> : <span />}
          <span className="text-slate">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={qs(page + 1)}>Next →</Link> : <span />}
        </div>
      )}

      <Panel title="Import or update from a registry CSV" className="mt-8">
        <ImportForm />
      </Panel>
    </>
  );
}
