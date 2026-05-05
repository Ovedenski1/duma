"use client";

import { useEffect, useState } from "react";

type ModalType = "cookies" | "privacy" | "about" | null;

export default function Footer() {
  const [open, setOpen] = useState<ModalType>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function closeModal() {
    setOpen(null);
  }

  return (
    <>
      <footer className="mt-6 pb-4 text-center text-xs text-white/60">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          <button onClick={() => setOpen("cookies")} className="transition hover:text-white">
            Бисквитки
          </button>

          <span>•</span>

          <button onClick={() => setOpen("privacy")} className="transition hover:text-white">
            Поверителност
          </button>

          <span>•</span>

          <button onClick={() => setOpen("about")} className="transition hover:text-white">
            За проекта
          </button>
        </div>

        <div className="mt-2 text-[10px] text-white/40">
          © 2026 Думички
        </div>
      </footer>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-purple-300/20 bg-[#1a0033] p-6 text-left shadow-2xl"
          >
            {open === "cookies" && (
              <>
                <h2 className="mb-4 text-center text-xl font-black text-white">
                  Бисквитки
                </h2>

                <p className="text-sm leading-relaxed text-white/80">
                  Думички използва локално съхранение в браузъра, за да запази
                  напредъка ти в играта — например кои дни си играл, какви опити
                  си направил и дали си спечелил или загубил.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Тези данни остават на твоето устройство и могат да бъдат
                  изтрити по всяко време от настройките на браузъра.
                </p>
              </>
            )}

            {open === "privacy" && (
              <>
                <h2 className="mb-4 text-center text-xl font-black text-white">
                  Поверителност
                </h2>

                <p className="text-sm leading-relaxed text-white/80">
                  Думички не изисква регистрация и не събира лични данни като
                  име, имейл или парола от играчите.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Напредъкът от играта се съхранява локално в браузъра на
                  потребителя.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Възможно е сайтът да използва Vercel Analytics за анонимна
                  статистика — например брой посещения и използвани устройства.
                  Тази информация се използва само за подобряване на сайта.
                </p>
              </>
            )}

            {open === "about" && (
              <>
                <h2 className="mb-4 text-center text-xl font-black text-white">
                  За проекта
                </h2>

                <p className="text-sm leading-relaxed text-white/80">
                  Думички е ежедневна игра с думи на български език. Всеки ден
                  има една дума за познаване.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Играта е създадена от Любослав Оведенски.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Проектът е вдъхновен от Wordle.
                </p>

                
              </>
            )}

            <button
              onClick={closeModal}
              className="mt-5 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-black text-white transition hover:bg-purple-500"
            >
              Затвори
            </button>
          </div>
        </div>
      )}
    </>
  );
}