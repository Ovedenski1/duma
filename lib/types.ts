export type LetterStatus = "empty" | "absent" | "present" | "correct";

export type GuessResult = {
  letter: string;
  status: LetterStatus;
};

export type HintData = {
  rowIndex: number;
  index: number;
  letter: string;
};

export type StoredGame = {
  date: string;
  guesses: string[];
  statuses: GuessResult[][];
  completed: boolean;
  won: boolean;
  hintUsed?: boolean;
  hint?: HintData | null;
};