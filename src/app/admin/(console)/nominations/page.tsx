import { desc } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { nominations } from "@/db/schema";
import { AdminHeader } from "@/components/admin/ui";
import { Badge, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteNomination, setNominationStatus } from "../../actions";

const ACCENT = { new: "amber", reviewed: "blue", featured: "green", declined: "red" } as const;

export default async function NominationsPage() {
  await requireAdmin();
  const rows = await db.select().from(nominations).orderBy(desc(nominations.createdAt)).limit(200);

  return (
    <>
      <AdminHeader title="Spotlight nominations" sub="Peer and self-nominations from the public Spotlight page. Verify, get consent, then write the story." />
      {rows.length === 0 ? (
        <EmptyState title="No nominations yet" body="They'll appear here when someone submits the form on /spotlight." />
      ) : (
        <ul className="space-y-4">
          {rows.map((n) => (
            <li key={n.id} className="rounded-[12px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold">{n.nomineeName}</p>
                  <p className="text-sm text-slate">
                    Nominated by {n.nominatorName} ·{" "}
                    <a href={`mailto:${n.nominatorEmail}`} className="font-bold text-green-deep hover:underline">
                      {n.nominatorEmail}
                    </a>{" "}
                    · {formatDate(n.createdAt)}
                  </p>
                </div>
                <Badge accent={ACCENT[n.status as keyof typeof ACCENT]}>{n.status}</Badge>
              </div>
              <p className="mt-4 whitespace-pre-line">{n.reason}</p>
              {n.evidenceUrl && (
                <a href={n.evidenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-green-deep hover:underline">
                  <ExternalLink className="size-4" /> Evidence
                </a>
              )}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {(["reviewed", "featured", "declined", "new"] as const)
                  .filter((s) => s !== n.status)
                  .map((s) => (
                    <form key={s} action={setNominationStatus}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className="rounded-full border border-line px-3 py-1 text-sm font-bold hover:border-ink">Mark {s}</button>
                    </form>
                  ))}
                <form action={deleteNomination}>
                  <input type="hidden" name="id" value={n.id} />
                  <ConfirmButton message="Delete this nomination permanently?" className="rounded-full px-3 py-1 text-sm font-bold text-red hover:bg-red-tint">
                    Delete
                  </ConfirmButton>
                </form>
                <ButtonLink href="/admin/spotlights/new" size="sm" className="ml-auto">
                  Write the story
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
