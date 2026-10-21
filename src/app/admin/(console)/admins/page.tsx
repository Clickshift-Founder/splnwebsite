import { asc } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { AdminHeader, Panel, Table } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/text";
import { setAdminActive } from "../../actions";
import { AdminUserForm, PasswordForm } from "./forms";

export default async function AdminsPage() {
  const me = await requireAdmin();
  const isSuper = me.role === "super_admin";
  const rows = isSuper ? await db.select().from(admins).orderBy(asc(admins.name)) : [];

  return (
    <>
      <AdminHeader title="Admins & security" sub="Directors and editors who can sign in to this console." />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {isSuper ? (
          <div className="space-y-6">
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Last sign-in</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className={a.isActive ? "" : "opacity-50"}>
                    <td>
                      <p className="font-bold">{a.name}</p>
                      <p className="text-xs text-slate">{a.email}</p>
                    </td>
                    <td>
                      <Badge accent={a.role === "super_admin" ? "green" : "blue"}>{a.role === "super_admin" ? "Super admin" : "Editor"}</Badge>
                    </td>
                    <td className="text-slate">{a.lastLoginAt ? formatDate(a.lastLoginAt, { day: "numeric", month: "short", year: "numeric" }) : "Never"}</td>
                    <td className="text-right">
                      {a.id !== me.id && (
                        <form action={setAdminActive}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="active" value={a.isActive ? "0" : "1"} />
                          <button className="text-sm font-bold text-slate hover:text-red">{a.isActive ? "Deactivate" : "Reactivate"}</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Panel title="Add or reset an admin">
              <AdminUserForm />
              <p className="mt-4 text-xs text-slate">
                Editors can manage graduates, numbers, Spotlight and Insights. Super admins can also manage countries, classes and admin accounts. Using an existing email resets that admin&apos;s password.
              </p>
            </Panel>
          </div>
        ) : (
          <Panel title="Your role">
            <p>You&apos;re an editor. Ask a super admin to add or change admin accounts.</p>
          </Panel>
        )}
        <Panel title="Change your password">
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
