"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const LETTERS = ["явертъуиопч", "асдфгхйклшщ", "зъцжбнмю"];

type AdminWord = {
  play_date: string;
  word: string;
};

function todayString() {
  const d = new Date();
  return localDateString(d);
}

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthTitle(date: Date) {
  return date.toLocaleDateString("bg-BG", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminPanel() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [word, setWord] = useState("");
  const [wordsByDate, setWordsByDate] = useState<Map<string, string>>(new Map());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const today = todayString();
  const savedWord = wordsByDate.get(selectedDate) || "";
  const hasWord = wordsByDate.has(selectedDate);
  const locked = hasWord && selectedDate <= today;

  async function loadWords() {
    const res = await fetch("/api/admin/words");
    const data = await res.json();

    if (res.ok) {
      const map = new Map<string, string>();

      data.words.forEach((item: AdminWord) => {
        map.set(item.play_date, item.word);
      });

      setWordsByDate(map);
    }
  }

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    setWord(savedWord);
    setMessage("");
  }, [selectedDate, savedWord]);

  function changeMonth(amount: number) {
    setMonthDate(
      new Date(monthDate.getFullYear(), monthDate.getMonth() + amount, 1)
    );
  }

  const calendarDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [monthDate]);

  function selectDate(dateString: string) {
    setSelectedDate(dateString);
  }

  function addLetter(letter: string) {
    if (locked || word.length >= 7) return;
    setWord((prev) => prev + letter);
  }

  function removeLetter() {
    if (locked) return;
    setWord((prev) => prev.slice(0, -1));
  }

  function clearWord() {
    if (locked) return;
    setWord("");
  }

  async function saveWord() {
    if (locked) {
      setMessage("Тази дата вече не може да се редактира.");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word, playDate: selectedDate }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Грешка при записване.");
      return;
    }

    setMessage("Думата е запазена.");
    await loadWords();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1a0033] via-[#2a004d] to-[#0d001a] px-3 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(168,85,247,0.28),transparent_55%)]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-purple-100 sm:text-4xl">
            Админ
          </h1>

          <button
            onClick={logout}
            className="px-3 py-2 text-sm font-black text-purple-100 transition hover:text-white sm:text-base"
          >
            Изход
          </button>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                className="px-3 py-2 text-lg font-black text-purple-100 transition hover:text-white"
              >
                ←
              </button>

              <h2 className="text-xl font-black capitalize text-purple-100 sm:text-2xl">
                {monthTitle(monthDate)}
              </h2>

              <button
                onClick={() => changeMonth(1)}
                className="px-3 py-2 text-lg font-black text-purple-100 transition hover:text-white"
              >
                →
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black text-purple-100/50 sm:gap-2 sm:text-xs">
              {["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((date, index) => {
                if (!date) return <div key={index} className="aspect-square" />;

                const dateString = localDateString(date);
                const dateHasWord = wordsByDate.has(dateString);
                const selected = selectedDate === dateString;

                return (
                  <button
                    key={dateString}
                    onClick={() => selectDate(dateString)}
                    className={[
                      "aspect-square border text-sm font-black transition sm:text-lg",
                      dateHasWord
                        ? "border-green-300 bg-green-500 text-white"
                        : "border-purple-300/20 bg-purple-950/60 text-purple-100 hover:bg-purple-800",
                      selected ? "ring-2 ring-purple-300/60 sm:ring-4" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full">
            <p className="text-xs font-black uppercase tracking-widest text-purple-100/50 sm:text-sm">
              Избрана дата
            </p>

            <h2 className="mt-1 text-xl font-black text-purple-100 sm:text-2xl">
              {formatDate(selectedDate)}
            </h2>

            {locked && (
              <p className="mt-2 text-xs font-bold text-purple-100/70 sm:text-sm">
                Думата за тази дата вече не може да се редактира.
              </p>
            )}

            <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center border border-purple-300/30 bg-purple-950/60 text-xl font-black uppercase text-white sm:text-2xl"
                >
                  {word[i] || ""}
                </div>
              ))}
            </div>

            <div
              className={`mt-5 space-y-1.5 sm:space-y-2 ${
                locked ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {LETTERS.map((row) => (
                <div key={row} className="flex justify-center gap-1">
                  {row.split("").map((letter) => (
                    <button
                      key={letter}
                      onClick={() => addLetter(letter)}
                      className="h-9 w-[28px] bg-purple-700 text-[10px] font-black uppercase text-white transition hover:bg-purple-600 sm:h-10 sm:w-9 sm:text-sm"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={removeLetter}
                  className="h-10 bg-purple-700 font-black text-white transition hover:bg-purple-600 sm:h-11"
                >
                  ⌫
                </button>

                <button
                  onClick={clearWord}
                  className="h-10 bg-purple-700 text-sm font-black text-white transition hover:bg-purple-600 sm:h-11 sm:text-base"
                >
                  Изчисти
                </button>
              </div>
            </div>

            <button
              onClick={saveWord}
              disabled={loading || locked}
              className="mt-5 w-full rounded-2xl bg-purple-500 px-4 py-4 font-black text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Запазване..." : "Задай дума"}
            </button>

            <p className="mt-4 min-h-6 text-center text-sm font-bold text-purple-100 sm:text-base">
              {message}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}