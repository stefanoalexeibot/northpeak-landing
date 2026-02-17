import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("id, rating, title, content, submitted_at, clients(name, company)")
    .eq("is_approved", true)
    .eq("is_published", true)
    .order("submitted_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(testimonials);
}
