"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      console.log("LOGIN ERROR:", error);

      // по-човешки съобщения
      if (error.message.includes("Invalid login credentials")) {
        setMessage("Невалиден имейл или парола.");
      } else {
        setMessage("Грешка при вход. Опитай отново.");
      }

      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-[2rem] border border-purple-300/20 bg-white/10 p-8 shadow-2xl shadow-purple-950/40 backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          {/* ЛОГО */}
          <div className="mx-auto mb-4 text-3xl font-extrabold tracking-widest sm:text-4xl">
  <span className="text-white">ДУ</span>
  <span className="text-[#00966E]">МИ</span>
  <span className="text-[#D62612]">ЧКА</span>
</div>

          {/* TITLE */}
          <h1 className="text-3xl font-black tracking-tight text-white">
  Админ вход
</h1>
        </div>

        <div className="space-y-4">
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Имейл"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-purple-300/20 bg-purple-950/60 px-4 py-3 text-white outline-none transition placeholder:text-purple-100/40 focus:border-purple-300 focus:ring-4 focus:ring-purple-500/20"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Парола"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-purple-300/20 bg-purple-950/60 px-4 py-3 text-white outline-none transition placeholder:text-purple-100/40 focus:border-purple-300 focus:ring-4 focus:ring-purple-500/20"
          />

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-purple-500 px-4 py-3 font-black text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Влизане..." : "Вход"}
          </button>

          {/* ERROR */}
          <p className="min-h-6 text-center text-sm font-semibold text-red-400">
            {message}
          </p>
        </div>
      </form>
    </main>
  );
}