"use client";

import { LetterStatus } from "@/lib/types";

const rows = [
  "явертъуиопч".split(""),     // 👈 added Ч
  "асдфгхйклшщ".split(""),     // 👈 added Ш Щ
  ["ENTER", ..."зъцжбнмю".split(""), "BACKSPACE"], // 👈 added Ю
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
    <div className="mt-3 w-full max-w-[640px] space-y-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isSpecial = key.length > 1;

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={[
                  "h-10 flex items-center justify-center font-black uppercase shadow transition",

                  // responsive sizing (keeps everything fitting)
                  isSpecial
                    ? "min-w-[50px] px-2 text-[8px] sm:min-w-[78px] sm:px-3 sm:text-sm"
                    : "w-[28px] text-[10px] sm:w-[43px] sm:text-sm",

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