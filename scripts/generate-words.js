import fs from "fs";
import bg from "dictionary-bg";

const raw = bg.dic.toString("utf-8").split("\n");

const words = raw
  .slice(1)
  .map((line) => line.split("/")[0].trim().toLowerCase())
  .filter((word) => /^[а-я]{7}$/.test(word));

const unique = [...new Set(words)];

console.log("Words:", unique.length);

fs.mkdirSync("./lib/words", { recursive: true });

fs.writeFileSync(
  "./lib/words/guesses-bg.ts",
  `export const GUESSES = ${JSON.stringify(unique, null, 2)};`
);

fs.writeFileSync(
  "./lib/words/answers-bg.ts",
  `export const ANSWERS = ${JSON.stringify(unique.slice(0, 300), null, 2)};`
);