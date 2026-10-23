import { NextResponse } from "next/server";
import { getAdmin, getMember } from "@/lib/auth";
import { storeImage, UploadError } from "@/lib/storage";
import { SITE } from "@/content/site";

const FOLDERS = new Set(["profiles", "spotlights", "posts", "gallery"]);

/** Image upload for admins and verified graduates. Returns { url }. */
export async function POST(req: Request) {
  const [admin, member] = await Promise.all([getAdmin(), getMember()]);
  if (!admin && !member) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!FOLDERS.has(folder)) return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
  // Graduates may only upload their own profile photo and article images.
  if (!admin && !["profiles", "posts"].includes(folder)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  try {
    const url = await storeImage(file, folder);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("[upload] storage failed", e);
    return NextResponse.json(
      { error: `Photo upload isn't working right now. Please try again later, or write to ${SITE.contactEmail}.` },
      { status: 500 },
    );
  }
}
