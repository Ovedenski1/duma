"use client";

import { useEffect, useMemo, useState } from "react";
import { loadAllGames } from "@/lib/storage";
import { StoredGame } from "@/lib/types";

type WordDate = {
  play_date: string;
};

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthName(date: Date) {
  return date.toLocaleDateString("bg-BG", {
    month: "long",
    year: "numeric",
  });
}

export default function PreviousWords({ selectedDate, onSelectDate }: Props) {
  const [dates, setDates] = useState<WordDate[]>([]);
  const [games, setGames] = useState<StoredGame[]>([]);

  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date(`${selectedDate}T00:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  async function loadDates() {
    const res = await fetch("/api/words");
    const data = await res.json();

    if (res.ok) {
      setDates(data.words || []);
    }

    setGames(loadAllGames());
  }

  useEffect(() => {
    loadDates();
  }, [selectedDate]);

  const availableDates = useMemo(
    () => new Set(dates.map((d) => String(d.play_date).slice(0, 10))),
    [dates]
  );

  function gameForDate(date: string) {
    return games.find((game) => game.date === date);
  }

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

  function dayClass(dateString: string) {
    const game = gameForDate(dateString);

    if (!availableDates.has(dateString)) {
      return "bg-zinc-900/80 text-zinc-600 border-zinc-700 cursor-not-allowed";
    }

    if (!game) {
      return "bg-purple-950/70 text-purple-100 border-purple-500/20 hover:bg-purple-800/70";
    }

    if (game.completed && game.won) {
      return "bg-green-500 text-white border-green-300";
    }

    if (game.completed && !game.won) {
      return "bg-red-500 text-white border-red-300";
    }

    return "bg-orange-500 text-white border-orange-300";
  }

  return (
    <section className="mx-auto w-full max-w-[620px] px-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          onClick={() => changeMonth(-1)}
          className="border border-purple-300/20 bg-purple-950/70 px-3 py-1.5 text-sm font-black transition hover:bg-purple-800 sm:px-4 sm:py-2"
        >
          ←
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black capitalize text-purple-100 sm:text-2xl">
            {getMonthName(monthDate)}
          </h2>
          <p className="text-[10px] text-purple-100/60 sm:text-xs">Избери ден</p>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="border border-purple-300/20 bg-purple-950/70 px-3 py-1.5 text-sm font-black transition hover:bg-purple-800 sm:px-4 sm:py-2"
        >
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase tracking-widest text-purple-100/50 sm:gap-1.5 sm:text-[10px]">
        {["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mx-auto grid max-w-[520px] grid-cols-7 gap-1 sm:gap-1.5">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} className="aspect-square" />;

          const dateString = localDateString(date);
          const available = availableDates.has(dateString);
          const isSelected = selectedDate === dateString;

          return (
            <button
              key={dateString}
              disabled={!available}
              onClick={() => onSelectDate(dateString)}
              className={[
                "flex aspect-square items-center justify-center border text-xs font-black transition sm:text-sm",
                dayClass(dateString),
                isSelected ? "ring-2 ring-purple-300/60" : "",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}