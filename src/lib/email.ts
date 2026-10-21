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

export function codeEmail(name: string, code: string) {
  const first = name.split(" ")[0];
  return {
    subject: `${code} is your SPLN verification code`,
    text: `Hello ${first},\n\nYour SPPG Public Leaders Network verification code is ${code}. It expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email. Nobody can edit your profile without this code.\n\nSPLN Secretariat`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1a1a1a">
  <div style="height:4px;background:linear-gradient(90deg,#05AF4B 0 25%,#009CD9 25% 50%,#D80A15 50% 75%,#F2A421 75%)"></div>
  <p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#55606B;margin-top:24px">SPPG Public Leaders Network</p>
  <p>Hello ${first},</p>
  <p>Your verification code is:</p>
  <p style="font-size:34px;font-weight:800;letter-spacing:.3em;margin:8px 0 16px">${code}</p>
  <p style="color:#55606B;font-size:14px">It expires in 15 minutes. If you didn't request this, ignore this email. Nobody can edit your profile without this code.</p>
  <p style="color:#55606B;font-size:14px">SPLN Secretariat</p>
</div>`,
  };
}
