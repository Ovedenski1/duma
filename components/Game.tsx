"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import Keyboard from "./Keyboard";
import PreviousWords from "./PreviousWords";
import Footer from "./Footer";
import { GuessResult, HintData, LetterStatus, StoredGame } from "@/lib/types";
import { loadGame, saveGame } from "@/lib/storage";

const WORD_LENGTH = 7;
const MAX_TRIES = 5;
const FLIP_DELAY = 260;
const FLIP_DURATION = 700;

function todayString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);

  return date.toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^а-я]/g, "");
}

function getLetterStatuses(statuses: GuessResult[][]) {
  const priority: Record<LetterStatus, number> = {
    empty: 0,
    absent: 1,
    present: 2,
    correct: 3,
  };

  const map: Record<string, LetterStatus> = {};

  statuses.flat().forEach(({ letter, status }) => {
    if (!map[letter] || priority[status] > priority[map[letter]]) {
      map[letter] = status;
    }
  });

  return map;
}

export default function Game() {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [view, setView] = useState<"game" | "calendar">("game");

  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<GuessResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");

  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);
  const [revealedTile, setRevealedTile] = useState(-1);

  const [hintMode, setHintMode] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hint, setHint] = useState<HintData | null>(null);

  useEffect(() => {
    const saved = loadGame(selectedDate);

    if (saved) {
      setGuesses(saved.guesses);
      setStatuses(saved.statuses);
      setCompleted(saved.completed);
      setWon(saved.won);
      setHintUsed(Boolean(saved.hintUsed));
      setHint(saved.hint || null);
    } else {
      setGuesses([]);
      setStatuses([]);
      setCompleted(false);
      setWon(false);
      setHintUsed(false);
      setHint(null);
    }

    setCurrentGuess("");
    setMessage("");
    setAnswer("");
    setShakingRow(null);
    setFlippingRow(null);
    setRevealedTile(-1);
    setHintMode(false);
  }, [selectedDate]);

  const letterStatuses = useMemo(() => getLetterStatuses(statuses), [statuses]);

  function persist(next: Partial<StoredGame>) {
    saveGame({
      date: selectedDate,
      guesses,
      statuses,
      completed,
      won,
      hintUsed,
      hint,
      ...next,
    });
  }

  function fireConfetti() {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ffffff", "#00966E", "#D62612"],
    });
  }

  function shakeCurrentRow() {
    const row = guesses.length;
    setShakingRow(row);
    setTimeout(() => setShakingRow(null), 400);
  }

  function addLetter(letter: string) {
    if (completed || flippingRow !== null || currentGuess.length >= WORD_LENGTH) {
      return;
    }

    const cleanLetter = normalizeWord(letter);
    if (!cleanLetter) return;

    setCurrentGuess((prev) => prev + cleanLetter);
  }

  function removeLetter() {
    if (completed || flippingRow !== null) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }

  function startHint() {
    if (completed || flippingRow !== null || hintUsed) return;

    setHintMode(true);
    setMessage("Избери кутийка за разкриване.");
  }

  async function revealHint(index: number) {
    if (!hintMode || hintUsed || completed || flippingRow !== null) return;

    const res = await fetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, index }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Възникна грешка.");
      setHintMode(false);
      return;
    }

    const nextHint: HintData = {
      rowIndex: guesses.length,
      index: data.index,
      letter: data.letter,
    };

    setHint(nextHint);
    setHintUsed(true);
    setHintMode(false);
    setMessage("Подсказката е използвана.");

    persist({
      hintUsed: true,
      hint: nextHint,
    });
  }

  async function submitGuess() {
    if (completed || flippingRow !== null) return;

    if (currentGuess.length !== WORD_LENGTH) {
      setMessage("Думата трябва да е точно 7 букви.");
      shakeCurrentRow();
      return;
    }

    if (guesses.includes(currentGuess)) {
      setMessage("Тази дума вече е използвана.");
      shakeCurrentRow();
      return;
    }

    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess: currentGuess, date: selectedDate }),
    });

    const data = await res.json();

    if (data.valid === false) {
      setMessage(data.error);
      shakeCurrentRow();
      return;
    }

    if (!res.ok) {
      setMessage("Възникна грешка.");
      return;
    }

    const rowIndex = guesses.length;
    const nextGuesses = [...guesses, currentGuess];
    const nextStatuses = [...statuses, data.result];

    const didWin = data.won;
    const didComplete = didWin || nextGuesses.length >= MAX_TRIES;

    setGuesses(nextGuesses);
    setStatuses(nextStatuses);
    setCurrentGuess("");
    setFlippingRow(rowIndex);
    setRevealedTile(-1);
    setHintMode(false);

    for (let i = 0; i < WORD_LENGTH; i++) {
      setTimeout(() => {
        setRevealedTile(i);
      }, i * FLIP_DELAY + FLIP_DURATION / 2);
    }

    setTimeout(() => {
      setFlippingRow(null);
      setRevealedTile(-1);
      setWon(didWin);
      setCompleted(didComplete);

      if (didWin) {
        setMessage("Победа!");
        fireConfetti();
      } else if (didComplete) {
        setMessage("Загуба!");
        setAnswer(data.answer || "");
      } else {
        setMessage("");
      }

      persist({
        guesses: nextGuesses,
        statuses: nextStatuses,
        completed: didComplete,
        won: didWin,
        hintUsed,
        hint,
      });
    }, WORD_LENGTH * FLIP_DELAY + FLIP_DURATION);
  }

  function handleKey(key: string) {
    if (hintMode) {
      setHintMode(false);
      setMessage("");
    }

    if (key === "ENTER") submitGuess();
    else if (key === "BACKSPACE") removeLetter();
    else addLetter(key);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (view !== "game") return;

      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("BACKSPACE");
      else if (/^[а-яА-Я]$/.test(e.key)) handleKey(e.key);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const rows = Array.from({ length: MAX_TRIES }, (_, rowIndex) => {
    const guess = guesses[rowIndex];
    const isCurrent = rowIndex === guesses.length && !completed;
    const letters = guess || (isCurrent ? currentGuess : "");

    return Array.from({ length: WORD_LENGTH }, (_, i) => ({
      letter: letters[i] || "",
      status: statuses[rowIndex]?.[i]?.status || "empty",
    }));
  });

  function openPuzzle(date: string) {
    setSelectedDate(date);
    setView("game");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-2 sm:px-6 sm:py-3">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 sm:gap-5">
        <header className="w-full text-center">
          <h1 className="mb-3 text-3xl font-extrabold tracking-widest sm:mb-4 sm:text-5xl">
            <span className="text-white">ДУ</span>
            <span className="text-[#00966E]">МИ</span>
            <span className="text-[#D62612]">ЧКИ</span>
          </h1>
        </header>

        <div className="flex w-full max-w-2xl rounded-2xl border border-purple-300/20 bg-white/10 p-1 backdrop-blur">
          <button
            onClick={() => setView("game")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-black transition sm:py-2.5 ${
              view === "game"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                : "text-purple-100/70 hover:bg-white/10"
            }`}
          >
            Пъзел
          </button>

          <button
            onClick={() => setView("calendar")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-black transition sm:py-2.5 ${
              view === "calendar"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                : "text-purple-100/70 hover:bg-white/10"
            }`}
          >
            Предишни думи
          </button>
        </div>

        <div className="flex min-h-[560px] w-full flex-col items-center">
          {view === "calendar" ? (
            <PreviousWords
              selectedDate={selectedDate}
              onSelectDate={openPuzzle}
            />
          ) : (
            <section className="flex w-full max-w-3xl flex-col items-center px-1">
              <div className="relative mb-1.5 w-full max-w-[420px] sm:max-w-[470px]">
                <h2 className="text-center text-xl font-black text-purple-100 sm:text-2xl">
                  {formatDate(selectedDate)}
                </h2>

                <button
                  onClick={startHint}
                  disabled={completed || hintUsed || flippingRow !== null}
                  className={[
                    "absolute right-0 top-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-[10px] font-black transition sm:text-xs",
                    hintUsed
                      ? "cursor-not-allowed border-zinc-500/40 bg-zinc-700/40 text-zinc-300 opacity-70"
                      : "border-green-300/40 bg-green-500/20 text-green-100 hover:bg-green-500/30",
                  ].join(" ")}
                >
                  {hintMode ? "Разкрий" : "Подсказка"}
                </button>
              </div>

              <div className="grid w-full max-w-[420px] gap-1 sm:max-w-[470px] sm:gap-1.5">
                {rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`grid grid-cols-7 gap-1 sm:gap-1.5 ${
                      shakingRow === rowIndex
                        ? "animate-[shakeRow_400ms_ease]"
                        : ""
                    }`}
                  >
                    {row.map((cell, cellIndex) => {
                      const isCurrentRow =
                        rowIndex === guesses.length && !completed;
                      const isFlipping = flippingRow === rowIndex;
                      const isShaking = shakingRow === rowIndex;

                      const hintedHere =
                        hint && isCurrentRow && cellIndex === hint.index;

                      const showHintLetter = hintedHere && !cell.letter;

                      const tileRevealed =
                        !isFlipping || cellIndex <= revealedTile;

                      const visibleStatus = tileRevealed
                        ? cell.status
                        : "empty";

                      return (
                        <button
                          key={cellIndex}
                          type="button"
                          onClick={() => revealHint(cellIndex)}
                          style={{
                            animationDelay: isFlipping
                              ? `${cellIndex * FLIP_DELAY}ms`
                              : "0ms",
                          }}
                          className={[
                            "flex aspect-square items-center justify-center border text-lg font-black uppercase transition-transform sm:text-2xl",
                            isCurrentRow &&
                              cell.letter &&
                              "animate-[popTile_140ms_ease]",
                            isFlipping &&
                              "animate-[flipTile_700ms_ease_forwards]",
                            hintMode &&
                              isCurrentRow &&
                              "cursor-pointer border-green-300 bg-green-500/20 shadow-lg shadow-green-500/20",
                            showHintLetter &&
                              "border-green-300 bg-green-500 text-white shadow-lg shadow-green-500/40",
                            isShaking
                              ? "border-red-400 bg-red-600"
                              : showHintLetter
                              ? "border-green-300 bg-green-500"
                              : visibleStatus === "correct"
                              ? "border-green-400 bg-green-500"
                              : visibleStatus === "present"
                              ? "border-orange-400 bg-orange-500"
                              : visibleStatus === "absent"
                              ? "border-zinc-500 bg-zinc-700"
                              : "border-purple-300/30 bg-purple-950/50",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {showHintLetter
                            ? hint.letter
                            : hintMode && isCurrentRow && !cell.letter
                            ? "?"
                            : cell.letter}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-1 min-h-8 text-center">
                {completed ? (
                  <div className="animate-[resultPulse_450ms_ease]">
                    <p className="text-lg font-black uppercase tracking-widest text-white">
                      {won ? "ПОБЕДА" : "ЗАГУБА"}
                    </p>

                    {!won && answer && (
                      <div className="mt-1.5 border border-red-300 bg-red-600 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/30 sm:px-4 sm:py-2 sm:text-sm">
                        Думата беше: {answer}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold text-purple-100">{message}</p>
                )}
              </div>

              <Keyboard statuses={letterStatuses} onKey={handleKey} />
            </section>
          )}

          <Footer />
        </div>
      </div>
    </main>
  );
}