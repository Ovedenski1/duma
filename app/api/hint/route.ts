import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^а-я]/g, "");
}

function todaySofia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(req: Request) {
  const body = await req.json();

  const date = String(body.date || "");
  const index = Number(body.index);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Невалидна дата." }, { status: 400 });
  }

  if (date > todaySofia()) {
    return NextResponse.json(
      { error: "Тази дума още не е достъпна." },
      { status: 403 }
    );
  }

  if (!Number.isInteger(index) || index < 0 || index > 6) {
    return NextResponse.json(
      { error: "Невалидна позиция." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("daily_words")
    .select("word")
    .eq("play_date", date)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Няма дума за тази дата." },
      { status: 404 }
    );
  }

  const answer = normalizeWord(data.word);

  return NextResponse.json({
    index,
    letter: answer[index],
  });
}