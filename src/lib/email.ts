import "server-only";

type Mail = { to: string; subject: string; html: string; text: string };

/** Sends via Resend's HTTP API. Without RESEND_API_KEY (local dev) the message is logged instead. */
export async function sendEmail(mail: Mail): Promise<{ ok: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error("[email] RESEND_API_KEY missing — cannot send:", mail.subject);
      return { ok: false };
    }
    console.log(`\n[email:dev] To: ${mail.to}\nSubject: ${mail.subject}\n${mail.text}\n`);
    return { ok: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "SPLN <onboarding@resend.dev>", ...mail }),
  });
  if (!res.ok) console.error("[email] Resend error", res.status, await res.text());
  return { ok: res.ok };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The branded wrapper every SPLN email shares (frame bar + network label). `body` is trusted HTML. */
function shell(body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1a1a1a;line-height:1.5">
  <div style="height:4px;background:linear-gradient(90deg,#05AF4B 0 25%,#009CD9 25% 50%,#D80A15 50% 75%,#F2A421 75%)"></div>
  <p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#55606B;margin-top:24px">SPPG Public Leaders Network</p>
  ${body}
  <p style="color:#55606B;font-size:14px">SPLN Secretariat</p>
</div>`;
}

export function codeEmail(name: string, code: string) {
  const first = name.split(" ")[0];
  return {
    subject: `${code} is your SPLN verification code`,
    text: `Hello ${first},\n\nYour SPPG Public Leaders Network verification code is ${code}. It expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email. Nobody can edit your profile without this code.\n\nSPLN Secretariat`,
    html: shell(`<p>Hello ${esc(first)},</p>
  <p>Your verification code is:</p>
  <p style="font-size:34px;font-weight:800;letter-spacing:.3em;margin:8px 0 16px">${code}</p>
  <p style="color:#55606B;font-size:14px">It expires in 15 minutes. If you didn't request this, ignore this email. Nobody can edit your profile without this code.</p>`),
  };
}

/**
 * A plain notification: greeting, paragraphs, an optional quoted note (e.g. the editor's), and one button.
 * All inputs are plain text and are escaped here.
 */
export function noticeEmail(m: { subject: string; greeting: string; lines: string[]; note?: { label: string; text: string } | null; cta: { label: string; url: string } }) {
  const noteText = m.note ? `\n\n${m.note.label}:\n${m.note.text}` : "";
  return {
    subject: m.subject,
    text: `${m.greeting}\n\n${m.lines.join("\n\n")}${noteText}\n\n${m.cta.label}: ${m.cta.url}\n\nSPLN Secretariat`,
    html: shell(`<p>${esc(m.greeting)}</p>
  ${m.lines.map((l) => `<p>${esc(l)}</p>`).join("\n  ")}
  ${
    m.note
      ? `<div style="border-left:4px solid #009CD9;background:#EEF7FC;padding:12px 16px;margin:16px 0"><p style="margin:0 0 4px;font-weight:800">${esc(m.note.label)}</p><p style="margin:0;white-space:pre-line">${esc(m.note.text)}</p></div>`
      : ""
  }
  <p style="margin:24px 0"><a href="${esc(m.cta.url)}" style="background:#05AF4B;color:#fff;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:6px;display:inline-block">${esc(m.cta.label)}</a></p>`),
  };
}
