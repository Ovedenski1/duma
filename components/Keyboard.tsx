"use client";

import { LetterStatus } from "@/lib/types";

const rows = [
  "явертъуиопч".split(""),
  "асдфгхйклшщ".split(""),
  ["ENTER", ..."зьцжбнмю".split(""), "BACKSPACE"],
];

type Props = {
  statuses: Record<string, LetterStatus>;
  onKey: (key: string) => void;
};

export default function Keyboard({ statuses, onKey }: Props) {
  function keyClass(key: string) {
    const status = statuses[key];

    if (status === "correct") return "bg-green-500";
    if (status === "present") return "bg-orange-500";
    if (status === "absent") return "bg-zinc-700 text-zinc-400";

    return "bg-purple-700 hover:bg-purple-600";
  }

  return (
    <div className="mt-3 w-full max-w-[660px] space-y-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isSpecial = key.length > 1;

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={[
                  "flex h-10 items-center justify-center font-black uppercase shadow transition",
                  isSpecial
                    ? "min-w-[54px] px-2 text-[8px] sm:min-w-[78px] sm:px-3 sm:text-sm"
                    : "w-[30px] text-[10px] sm:w-[43px] sm:text-sm",
                  keyClass(key),
                ].join(" ")}
              >
                {key === "BACKSPACE"
                  ? "⌫"
                  : key === "ENTER"
                  ? "ВЪВЕДИ"
                  : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}