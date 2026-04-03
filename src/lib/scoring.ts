type Axis = "F" | "R" | "P" | "M";

interface ScoringEntry {
  [answerLetter: string]: Axis[];
}

export const SCORING_GRID: Record<number, ScoringEntry> = {
  // === Questions SOC (1, 2, 3, 4, 6, 8, 12) ===
  1:  { A: ["P"], B: ["F"], C: ["M"], D: ["R"] },
  2:  { A: ["M"], B: ["P"], C: ["R"], D: ["P"] },
  3:  { A: ["F"], B: ["M"], C: ["P"], D: ["R"] },
  4:  { A: ["F"], B: ["R"], C: ["P"], D: ["M"] },
  6:  { A: ["P"], B: ["R"], C: ["M"], D: ["F"] },
  8:  { A: ["R"], B: ["P"], C: ["F"], D: ["M"] },
  12: { A: ["R", "P"], B: ["P"] },

  // === Questions PSY (5, 7, 9, 10, 11, 13, 14) ===
  5:  { A: ["R"], B: ["P"], C: ["R", "M"], D: ["M"] },
  7:  { A: ["M"], B: ["F"], C: ["R"], D: ["P"] },
  9:  { A: ["F"], B: ["P"], C: ["R"], D: ["M"] },
  10: { A: ["F"], B: ["M"], C: ["P"], D: ["R"] },
  11: { A: ["P"], B: ["M"], C: ["R"], D: ["F", "P"] },
  13: { A: ["F", "P"], B: ["M"] },
  14: { A: ["F"], B: ["M"], C: ["P"], D: ["R"] },
};

// Catégories SOC / PSY
export const SOC_QUESTIONS = [1, 2, 3, 4, 6, 8, 12];
export const PSY_QUESTIONS = [5, 7, 9, 10, 11, 13, 14];

export interface Scores {
  F: number;
  R: number;
  P: number;
  M: number;
}

export interface FullResult {
  socScores: Scores;
  psyScores: Scores;
  totalScores: Scores;
  profileCode: string;
  profileName: string;
  profileVariant: string | null;
}

/**
 * Calcule les scores à partir des réponses.
 * @param answers - Map de numéro de question → lettre de réponse. Ex: { 1: "A", 2: "B", ... }
 */
export function computeScores(answers: Record<number, string>): FullResult {
  const socScores: Scores = { F: 0, R: 0, P: 0, M: 0 };
  const psyScores: Scores = { F: 0, R: 0, P: 0, M: 0 };

  for (const [qNumStr, answerLetter] of Object.entries(answers)) {
    const qNum = parseInt(qNumStr);
    const entry = SCORING_GRID[qNum];
    if (!entry) continue;

    const axes = entry[answerLetter];
    if (!axes) continue;

    const target = SOC_QUESTIONS.includes(qNum) ? socScores : psyScores;
    for (const axis of axes) {
      target[axis]++;
    }
  }

  const totalScores: Scores = {
    F: socScores.F + psyScores.F,
    R: socScores.R + psyScores.R,
    P: socScores.P + psyScores.P,
    M: socScores.M + psyScores.M,
  };

  // Profil simplifié pour le proto
  const profileCode = `F${totalScores.F}R${totalScores.R}P${totalScores.P}M${totalScores.M}`;

  return {
    socScores,
    psyScores,
    totalScores,
    profileCode,
    profileName: "PROFIL DE DÉMONSTRATION",
    profileVariant: "Algorithme prototype — le profil réel sera calculé en production avec la grille officielle IA2P",
  };
}
