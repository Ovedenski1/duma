import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function todaySofia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET() {
  const today = todaySofia();

  const { data, error } = await supabaseAdmin
    .from("daily_words")
    .select("play_date")
    .lte("play_date", today)
    .order("play_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ words: data });
}