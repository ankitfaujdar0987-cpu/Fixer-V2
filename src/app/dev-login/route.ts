import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Development shortcut. On a real (production) site it does nothing.
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { origin } = new URL(request.url);
  const email = process.env.DEV_ADMIN_EMAIL;
  const password = process.env.DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.redirect(`${origin}/?dev=missing-keys`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(
      `${origin}/?dev=${encodeURIComponent(error.message)}`
    );
  }
  return NextResponse.redirect(`${origin}/`);
}