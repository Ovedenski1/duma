import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Нямаш достъп." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("daily_words")
    .select("play_date, word")
    .order("play_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ words: data });
}

export async function POST(req: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Нямаш достъп." }, { status: 401 });
  }

  const body = await req.json();

  const word = normalizeWord(String(body.word || ""));
  const playDate = String(body.playDate || "");

  if (word.length !== 7) {
    return NextResponse.json(
      { error: "Думата трябва да е точно 7 букви." },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(playDate)) {
    return NextResponse.json(
      { error: "Избери валидна дата." },
      { status: 400 }
    );
  }

  const today = todaySofia();

  const { data: existing } = await supabaseAdmin
    .from("daily_words")
    .select("word")
    .eq("play_date", playDate)
    .maybeSingle();

  if (existing && playDate <= today) {
    return NextResponse.json(
      { error: "Дума за днешна или минала дата не може да се редактира." },
      { status: 403 }
    );
  }

  const { data: existingWord } = await supabaseAdmin
    .from("daily_words")
    .select("play_date")
    .eq("word", word)
    .maybeSingle();

  if (existingWord && existingWord.play_date !== playDate) {
    return NextResponse.json(
      { error: "Тази дума вече е използвана за друга дата." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("daily_words").upsert(
    {
      word,
      play_date: playDate,
    },
    { onConflict: "play_date" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("valid_words").upsert(
    {
      word,
    },
    { onConflict: "word" }
  );

  return NextResponse.json({ success: true });
}