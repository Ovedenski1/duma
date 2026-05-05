export type LetterStatus = "empty" | "absent" | "present" | "correct";

export type GuessResult = {
  letter: string;
  status: LetterStatus;
};

export type StoredGame = {
  date: string;
  guesses: string[];
  statuses: GuessResult[][];
  completed: boolean;
  won: boolean;
};