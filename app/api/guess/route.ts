import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GuessResult } from "@/lib/types";
import { GUESSES } from "@/lib/words/guesses-bg";

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

function scoreGuess(guess: string, answer: string): GuessResult[] {
  const result: GuessResult[] = guess.split("").map((letter) => ({
    letter,
    status: "absent",
  }));

  const used = Array(7).fill(false);
  const answerLetters = answer.split("");

  for (let i = 0; i < 7; i++) {
    if (guess[i] === answer[i]) {
      result[i].status = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < 7; i++) {
    if (result[i].status === "correct") continue;

    const foundIndex = answerLetters.findIndex(
      (letter, index) => letter === guess[i] && !used[index]
    );

    if (foundIndex !== -1) {
      result[i].status = "present";
      used[foundIndex] = true;
    }
  }

  return result;
}

export async function POST(req: Request) {
  const body = await req.json();

  const guess = normalizeWord(String(body.guess || ""));
  const date = String(body.date || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Невалидна дата." }, { status: 400 });
  }

  if (date > todaySofia()) {
    return NextResponse.json(
      { error: "Тази дума още не е достъпна." },
      { status: 403 }
    );
  }

  if (guess.length !== 7) {
    return NextResponse.json(
      { error: "Думата трябва да е точно 7 букви." },
      { status: 400 }
    );
  }

  if (!GUESSES.includes(guess)) {
    return NextResponse.json(
      { error: "Това не е валидна дума." },
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
  const result = scoreGuess(guess, answer);

  return NextResponse.json({
    result,
    won: guess === answer,
    answer,
  });
}