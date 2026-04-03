# Spécifications Exhaustives — Prototype IT2P Online
## Solydev × Institut IA2P

**Version** : 1.0 — Specs pour implémentation par Claude Code  
**Date** : 03/04/2026  
**Deadline livraison** : Lundi 07/04 ou Mardi 08/04/2026  
**Auteur** : Romain Koenig / Solydev  
**Client** : Sébastien Dunet — Institut IA2P / Synoème

---


**Launch commands**

npm install              # Install dependencies
npm run db:generate      # Generate Prisma client
cp .env.example .env     # Create environment file
npm run db:migrate       # Create database and run migrations (includes seeding)
npm run dev              # Starting locally

---




## 1. Objectif du prototype

Démontrer en conditions réelles le parcours cœur de l'outil IT2P en ligne :  
**Un praticien envoie un lien → un coaché passe le questionnaire → le praticien consulte le résultat (roue A2P + profil).**

Le prototype sert à montrer au client que Solydev a compris le besoin, la logique métier, et qu'on est capable de livrer un produit moderne et fonctionnel. Les fonctionnalités hors périmètre sont présentes visuellement dans l'interface en mode **"Coming Soon"**.

---

## 2. Stack technique

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Framework | **Next.js 14+ (App Router)** | SSR, API routes, déploiement simple |
| UI | **React + Tailwind CSS** | Rapidité de prototypage, rendu pro |
| Base de données | **SQLite (via Prisma)** | Embarqué, zéro config, suffisant pour proto |
| ORM | **Prisma** | Typage, migrations, compatible SQLite & PostgreSQL |
| Auth | **Credentials hardcodés** | Proto uniquement — 1 compte praticien en dur |
| Lien éphémère | **Token UUID en base** | Lien unique par passation, expirable |
| Déploiement | **AWS Lightsail (container)** | Simple, pas cher, IP fixe |
| PDF | **Hors scope proto** | Coming Soon dans l'UI |

---

## 3. Modèle de données (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Practitioner {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  company   String?
  logo      String?  // URL du logo pour personnalisation — Coming Soon
  sessions  Session[]
  createdAt DateTime @default(now())
}

model Session {
  id             String        @id @default(uuid())
  practitioner   Practitioner  @relation(fields: [practitionerId], references: [id])
  practitionerId String
  token          String        @unique // Token du lien éphémère
  coacheeName    String?       // Optionnel, renseigné par le praticien
  context        String?       // Ex: "Recrutement KEOPS", "Accompagnement Managérial"
  status         String        @default("PENDING") // PENDING | IN_PROGRESS | COMPLETED | EXPIRED
  expiresAt      DateTime      // Expiration du lien (48h par défaut)
  answers        Answer[]
  result         Result?
  createdAt      DateTime      @default(now())
  completedAt    DateTime?
}

model Answer {
  id        String  @id @default(uuid())
  session   Session @relation(fields: [sessionId], references: [id])
  sessionId String
  question  Int     // Numéro de question (1-14)
  answer    String  // Lettre choisie (A, B, C, D)

  @@unique([sessionId, question])
}

model Result {
  id             String  @id @default(uuid())
  session        Session @relation(fields: [sessionId], references: [id])
  sessionId      String  @unique
  scoreF         Int     // Score axe F (Cérébralité / Réflexion)
  scoreR         Int     // Score axe R (Rigueur)
  scoreP         Int     // Score axe P (Implication personnelle)
  scoreM         Int     // Score axe M (Efficacité concrète)
  profileCode    String  // Ex: "FR0PM0"
  profileName    String  // Ex: "ADAPTATIF ET POLYVALENT"
  profileVariant String? // Ex: "POLYVALENT TENDANCE ANIMATEUR"
}
```

Note : SQLite ne supporte pas les enums Prisma, on utilise des String pour `status`.

---

## 4. Les 14 questions du questionnaire A2P

Voici le contenu exact à implémenter dans `lib/questions.ts`. Chaque question a un texte, des options (A/B/C/D ou A/B pour les questions 12 et 13), et un lexique optionnel affiché en tooltip ou section dépliable.

```typescript
export interface QuestionOption {
  letter: string;       // "A", "B", "C", "D"
  text: string;
}

export interface LexiqueEntry {
  term: string;
  definition: string;
}

export interface Question {
  number: number;
  text: string;
  options: QuestionOption[];
  lexique?: LexiqueEntry[];
  category: "SOC" | "PSY"; // Pour info — pas affiché au coaché
}

export const QUESTIONS: Question[] = [
  {
    number: 1,
    text: "Vous êtes dans une grande entreprise. Dans laquelle de ces 4 équipes souhaiteriez-vous travailler ?",
    options: [
      { letter: "A", text: "L'équipe qui présente les produits dans les foires internationales." },
      { letter: "B", text: "L'équipe qui cherche des produits nouveaux par la créativité." },
      { letter: "C", text: "L'équipe qui met au point une méthode de direction par objectifs." },
      { letter: "D", text: "L'équipe qui teste les produits en vue d'obtenir une norme de qualité." }
    ],
    lexique: [
      { term: "Norme de qualité", definition: "Définition du niveau indispensable de solidité, sécurité, fonctionnalité, etc." }
    ],
    category: "SOC"
  },
  {
    number: 2,
    text: "Vous fondez avec d'autres personnes une association sans but lucratif, que préférez-vous faire ?",
    options: [
      { letter: "A", text: "Rédiger les statuts et les définitions de fonction." },
      { letter: "B", text: "Présider le conseil d'administration." },
      { letter: "C", text: "Faire rentrer les cotisations et les subventions promises." },
      { letter: "D", text: "Organiser une grande réception des membres et de personnalités." }
    ],
    lexique: [
      { term: "Association sans but lucratif", definition: "Qui ne cherche pas à faire du bénéfice mais à rendre un service avec les moyens qu'elle a." },
      { term: "Statuts", definition: "Texte qui décrit le but de l'association et son fonctionnement interne." },
      { term: "Conseil d'administration", definition: "Groupe des membres qui ont la responsabilité des buts de l'association." }
    ],
    category: "SOC"
  },
  {
    number: 3,
    text: "Quelle profession choisiriez-vous si vous n'aviez qu'une de ces 4 suivantes à choisir ?",
    options: [
      { letter: "A", text: "Poète." },
      { letter: "B", text: "Juge." },
      { letter: "C", text: "Représentant." },
      { letter: "D", text: "Mathématicien." }
    ],
    lexique: [
      { term: "Représentant", definition: "Délégué de l'entreprise auprès de la clientèle pour prendre les commandes." }
    ],
    category: "SOC"
  },
  {
    number: 4,
    text: "Vous faites partie du conseil municipal et vous devez opter pour l'une des 4 commissions suivantes. Laquelle choisissez-vous ?",
    options: [
      { letter: "A", text: "Commission Plan d'Urbanisme à long terme." },
      { letter: "B", text: "Commission Problèmes de Délinquance." },
      { letter: "C", text: "Commission des Fêtes." },
      { letter: "D", text: "Commission Développement des Zones Industrielles." }
    ],
    lexique: [
      { term: "Opter", definition: "Décider de ce que l'on préfère quand il faut obligatoirement prendre quelque chose." },
      { term: "Commission", definition: "Groupe de personnes chargées d'étudier une question ou de régler une affaire." },
      { term: "Plan d'urbanisme à long terme", definition: "Plan qui prévoit et organise le développement des constructions publiques et privées de la ville." }
    ],
    category: "SOC"
  },
  {
    number: 5,
    text: "Vous devez faire une thèse sur l'un des 4 sujets suivants. Lequel choisissez-vous ?",
    options: [
      { letter: "A", text: "L'univers hospitalier." },
      { letter: "B", text: "Les coopératives ouvrières." },
      { letter: "C", text: "Le couple demain." },
      { letter: "D", text: "La famille en milieu rural." }
    ],
    lexique: [
      { term: "Thèse", definition: "Démonstration du bien-fondé de l'opinion que l'on a sur une chose." },
      { term: "Coopératives ouvrières", definition: "Entreprises où les ouvriers sont propriétaires du capital et élisent le patron." },
      { term: "Milieu rural", definition: "Les gens qui viennent de la campagne." }
    ],
    category: "PSY"
  },
  {
    number: 6,
    text: "Quelle profession choisiriez-vous si vous n'aviez qu'une des 4 suivantes à choisir ?",
    options: [
      { letter: "A", text: "Reporter international." },
      { letter: "B", text: "Membre d'un bureau d'études." },
      { letter: "C", text: "Conservateur des monuments historiques." },
      { letter: "D", text: "Directeur de la Maison des Jeunes et de la Culture." }
    ],
    lexique: [
      { term: "Bureau d'études", definition: "Cabinet privé ou service d'entreprise où l'on conçoit, calcule, étudie, dessine les plans d'installations et dispositifs nouveaux ou de prototypes." }
    ],
    category: "SOC"
  },
  {
    number: 7,
    text: "Laquelle de ces 4 exclamations pourrait être une de vos réactions ?",
    options: [
      { letter: "A", text: "Faut pas exagérer." },
      { letter: "B", text: "À y bien réfléchir." },
      { letter: "C", text: "Dis donc, ça paye." },
      { letter: "D", text: "Ça, c'est chouette !" }
    ],
    lexique: [],
    category: "PSY"
  },
  {
    number: 8,
    text: "Laquelle de ces affirmations correspond le mieux à vos sentiments profonds ?",
    options: [
      { letter: "A", text: "Il faut se regrouper pour protéger les acquis." },
      { letter: "B", text: "Il faut se rencontrer pour mettre en question les acquis." },
      { letter: "C", text: "Il faut se retrouver pour réfléchir sur les acquis." },
      { letter: "D", text: "Il faut se rassembler pour aller jusqu'au bout des conquêtes possibles." }
    ],
    lexique: [
      { term: "Les acquis", definition: "Biens matériels, avantages ; droits, obtenus par l'action collective au fil des années." }
    ],
    category: "SOC"
  },
  {
    number: 9,
    text: "Si vous deviez vous intéresser à de nouvelles formes de vie sociale, que préféreriez-vous ?",
    options: [
      { letter: "A", text: "Les découvrir." },
      { letter: "B", text: "Les vivre." },
      { letter: "C", text: "Les théoriser." },
      { letter: "D", text: "Les confronter aux valeurs sociales." }
    ],
    lexique: [
      { term: "Vie sociale", definition: "Façon dont les gens vivent ensemble en société." },
      { term: "Théoriser", definition: "Trouver et dire quels sont les principes de fonctionnement qui expliquent qu'une chose est comme elle est." },
      { term: "Valeurs sociales", definition: "Principes moraux qui sont reconnus importants pour le bon fonctionnement des groupes humains." }
    ],
    category: "PSY"
  },
  {
    number: 10,
    text: "Laquelle de ces 4 expressions a le plus de chance de venir dans votre conversation ?",
    options: [
      { letter: "A", text: "Euréka ! j'ai trouvé." },
      { letter: "B", text: "La sagesse populaire dit…" },
      { letter: "C", text: "Luttons !" },
      { letter: "D", text: "On les tient !" }
    ],
    lexique: [
      { term: "Euréka", definition: "Ce qu'a dit, en grec, Archimède, quand il a découvert le théorème d'Archimède." }
    ],
    category: "PSY"
  },
  {
    number: 11,
    text: "Vous êtes invité à une soirée costumée, quelle est votre réaction ?",
    options: [
      { letter: "A", text: "Terrible, chouette, on va rigoler." },
      { letter: "B", text: "Je ne veux pas me prêter à ces mascarades." },
      { letter: "C", text: "C'est un jeu tout à fait traditionnel qui ne fait que pousser à ses limites le comportement que l'on a dans toute soirée." },
      { letter: "D", text: "C'est un excellent moyen pour attirer du monde, donc pour rencontrer des gens." }
    ],
    lexique: [
      { term: "Mascarades", definition: "Fêtes où l'on s'amuse sous un masque ou un déguisement." }
    ],
    category: "PSY"
  },
  {
    number: 12,
    text: "On vous offre un tableau. Vous avez à choisir entre deux scènes : sur l'une on voit Gandhi, sur l'autre on voit Marco Polo, quel tableau acceptez-vous ?",
    options: [
      { letter: "A", text: "Gandhi." },
      { letter: "B", text: "Marco Polo." }
    ],
    lexique: [
      { term: "Gandhi", definition: "Sage de l'Inde qui, par la non-violence obstinée, a contraint l'Angleterre à décoloniser. Mort assassiné en 1948." },
      { term: "Marco Polo", definition: "Riche marchand de Venise au 13e siècle qui visita pacifiquement l'Asie, la fit connaître à l'Europe et établit les premières relations commerciales avec la Chine." }
    ],
    category: "SOC"
  },
  {
    number: 13,
    text: "Qu'est-ce qui est le plus important pour vous dans la vie ?",
    options: [
      { letter: "A", text: "Organiser son plaisir." },
      { letter: "B", text: "Gérer ses biens." }
    ],
    lexique: [],
    category: "PSY"
  },
  {
    number: 14,
    text: "Tout compte fait, quel est le vecteur principal de votre comportement ?",
    options: [
      { letter: "A", text: "La réflexion." },
      { letter: "B", text: "La morale." },
      { letter: "C", text: "Le bonheur." },
      { letter: "D", text: "La vie." }
    ],
    lexique: [
      { term: "Vecteur", definition: "En mathématique, flèche qui indique l'intensité d'une force qui joue dans une direction déterminée." }
    ],
    category: "PSY"
  }
];
```

### Texte d'introduction du questionnaire (affiché avant de commencer)

```typescript
export const INTRO_TEXT = {
  title: "Évaluation A2P — Analyse de Personnalité Professionnelle",
  preambule: "Le test A2P est le test de vos dispositions naturelles pour une profession. Il vous expliquera comment vous fonctionnez spontanément en situation de travail et, en conséquence il vous dira pour quels types d'études et de métiers vous serez le plus épanoui et performant.",
  instructions: "Le test A2P est un questionnaire, donc une série de questions. À chaque question, des réponses vous sont proposées. Il vous est demandé de choisir celle qui se rapproche le plus de votre sentiment. Il n'y a donc pas de bonnes ou de mauvaises réponses.\n\nSi aucune réponse ne convient parfaitement, choisissez celle qui se rapproche le plus de votre sentiment.\n\nSi, au contraire, vous hésitez entre 2 réponses qui vous paraîtraient aussi valables l'une que l'autre, n'en retenez qu'une, celle qui fera pencher la balance même s'il n'y a que quelques décigrammes de différence.\n\nDonc une seule réponse, mais toujours une réponse.\n\nVous prendrez pour répondre, tout le temps qu'il vous faudra.",
  startButton: "Bonne passation — Commencer"
};
```

---

## 5. Algorithme de scoring (version proto — mock)

On ne dispose pas de la grille officielle de correspondance. On implémente un algorithme mock structurellement réaliste, déduit d'un exemple réel (passation Coralie Brouillet, document Soc_Psy).

### 5.1 Grille de scoring

```typescript
// lib/scoring.ts

// Chaque réponse attribue 1 point à un ou deux axes.
// Quand une réponse est mappée à 2 axes (ex: ["F","M"]), elle donne 1 point à chacun.
// Les questions SOC et PSY sont scorées séparément avant addition.

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
```

> **IMPORTANT** : Cette grille est une approximation. La grille officielle sera fournie par l'Institut IA2P et remplacera ce mock en production. Le moteur de scoring est découplé pour faciliter ce remplacement.

### 5.2 Vérification avec l'exemple connu

L'exemple Coralie Brouillet donne :
- SOC : F2 R2 P4 M2
- PSY : F3 R2 P2 M3  
- Total : F5 R4 P6 M5

Avec notre grille mock, les résultats doivent être approximativement cohérents (pas forcément identiques car la grille est déduite, pas officielle).

---

## 6. Composant Roue A2P (SVG React)

### 6.1 Description visuelle

La roue A2P est un graphique en forme d'octogone (losange aux coins coupés) avec :
- 4 axes orthogonaux : **F** (haut), **R** (bas), **P** (gauche), **M** (droite)
- Graduation de 1 à 13 sur chaque demi-axe (les nombres impairs sont affichés : 1, 3, 5, 7, 9, 11, 13)
- Grille de points en arrière-plan (dots réguliers)
- Le contour est un octogone (les diagonales coupent les coins du carré 13×13)
- Un **point focal** (symbole ⊗ en rouge) positionné selon les scores FRPM
- En-tête avec les métadonnées (date, analysé pour, résultat, type de personnalité)

### 6.2 Système de coordonnées

Le graphique utilise un repère 2D centré :
- **Axe horizontal** : P (gauche, valeurs croissantes vers la gauche) ↔ M (droite, valeurs croissantes vers la droite)
- **Axe vertical** : F (haut, valeurs croissantes vers le haut) ↔ R (bas, valeurs croissantes vers le bas)

Le point focal se positionne comme suit (en coordonnées de grille, chaque unité = 1 graduation) :

```typescript
// Position du point focal sur la grille
// Les scores totaux donnent le décalage sur chaque demi-axe
// Ex: F5 R4 P6 M5 → le point est à (M5 - P6, F5 - R4) = (-1, 1) en coordonnées grille

// Pour le proto, on simplifie : on place le point au centre du quadrant
// correspondant aux axes dominants, à une distance proportionnelle au score

function computeFocalPoint(scores: Scores): { gridX: number; gridY: number } {
  // gridX : positif = vers M (droite), négatif = vers P (gauche)
  // gridY : positif = vers F (haut), négatif = vers R (bas)
  return {
    gridX: scores.M - scores.P,
    gridY: scores.F - scores.R,
  };
}
```

### 6.3 Dimensions SVG

```typescript
// Dimensions recommandées
const SVG_WIDTH = 600;
const SVG_HEIGHT = 700; // Inclut l'en-tête métadonnées

// Zone du graphique (carrée)
const CHART_SIZE = 500;
const CHART_CENTER_X = SVG_WIDTH / 2;
const CHART_CENTER_Y = 350; // Décalé vers le bas pour l'en-tête
const GRID_STEP = CHART_SIZE / 26; // 13 graduations de chaque côté du centre

// L'octogone coupe les coins à environ 45°
// Les points aux extrémités des axes sont à 13 unités du centre
// Les coins de l'octogone sont à environ 9.2 unités sur chaque axe diagonal
```

### 6.4 Props du composant

```typescript
interface RoueA2PProps {
  scores: {
    F: number;
    R: number;
    P: number;
    M: number;
  };
  metadata: {
    date: string;           // "16/10/2023"
    analysedFor: string;    // "Accompagnement Managérial"
    coacheeName?: string;   // "Coralie BROUILLET"
    profileCode: string;    // "FR0PM0"
    profileName: string;    // "ADAPTATIF ET POLYVALENT"
    resultCode: string;     // "F5 R4 P6 M5"
  };
  // Coming Soon — toggle désactivé dans l'UI
  showSocPsy?: boolean;
  socScores?: Scores;
  psyScores?: Scores;
}
```

### 6.5 Éléments visuels à rendre

1. **En-tête** : cadre avec logo IT2P (texte "IT₂P" stylisé), puis tableau de métadonnées (date, analysé, résultat, point focal, type de personnalité)
2. **Labels des axes** : F (haut, grande lettre), R (bas), P (gauche), M (droite)
3. **Contour octogonal** : stroke noir, fill transparent
4. **Grille de points** : points de taille variable (plus gros = positions entières impaires), alternance gros/petits
5. **Axes centraux** : lignes verticale et horizontale passant par le centre
6. **Graduations** : nombres impairs (1, 3, 5, 7, 9, 11, 13) le long des axes
7. **Point focal** : symbole ⊗ en rouge (#D44), taille visible (~12px)
8. **Légende Soc/Psy** (Coming Soon) : petit encadré "PF2P ✱ / Soc ○ / Psy ●"

### 6.6 Couleurs du composant

- Fond du graphique : blanc `#FFFFFF`
- Contour octogonal : noir `#000000`, 1.5px
- Points de la grille : noir `#000000`, opacité variable (0.3 pour petits, 0.7 pour gros)
- Axes : noir `#333333`, 0.5px
- Graduations : gris `#666666`, font-size 10px
- Labels axes (F, R, P, M) : noir `#000000`, font-size 24px, bold
- Point focal ⊗ : rouge `#CC3333`, font-size 16px ou cercle + croix SVG
- En-tête : fond sable `#F5EBD8`, bordure `#D4C5A9`

---

## 7. Architecture des pages

### 7.1 Page Login (`/login`)

- Formulaire simple : email + mot de passe
- Credentials hardcodés comparés en API route
- En cas de succès : cookie httpOnly + redirect `/dashboard`
- Design : centré, logo IT2P en haut, sobre

### 7.2 Dashboard Praticien (`/dashboard`)

**Layout** : sidebar gauche + contenu principal

**Sidebar** :
- Logo Solydev ou IT2P
- Lien actif : "Mes passations" (le seul fonctionnel)
- Liens Coming Soon (grisés + badge) :
  - "Mon abonnement" 
  - "Personnalisation"
  - "Bilans collectifs"
  - "Administration IA2P"
- En bas : nom du praticien + bouton déconnexion

**Contenu principal — Liste des sessions** :
- Titre : "Mes passations"
- Bouton "Nouvelle passation" (couleur accent bleu)
- Tableau ou liste de cards avec colonnes :
  - Coaché (nom ou "Non renseigné")
  - Contexte
  - Date de création
  - Statut (badge couleur : jaune=En attente, bleu=En cours, vert=Terminé, gris=Expiré)
  - Actions : "Copier le lien" (si pending/in_progress), "Voir résultat" (si completed)
- Si aucune session : message d'onboarding "Créez votre première passation"

**Modal/page de création de session** :
- Champ : Nom du coaché (optionnel, placeholder "Ex: Marie Dupont")
- Champ : Contexte (optionnel, placeholder "Ex: Recrutement, Accompagnement managérial")
- Bouton "Créer la passation"
- Résultat : affiche le lien `https://[domain]/test/[token]` avec bouton copier

### 7.3 Vue Résultat (`/dashboard/session/[id]`)

- En-tête : infos de la session (coaché, contexte, date, statut)
- **Roue A2P** : composant SVG (voir section 6)
- **Scores** : affichage des 4 scores F, R, P, M dans des cards
- **Profil** : code + désignation
- **Coming Soon** (section grisée) :
  - "Texte descriptif du profil" avec un lorem ipsum dans un encadré grisé
  - Bouton "Exporter en PDF" grisé
  - Toggle "Analyse Soc/Psy" désactivé
  - Bouton "Saisie manuelle des réponses" grisé
- Bouton retour au dashboard

### 7.4 Tunnel de Passation (`/test/[token]`)

**Vérification du token** (avant rendu) :
- Token inexistant → page 404 avec message "Ce lien n'est pas valide"
- Token expiré → message "Ce lien a expiré. Contactez votre praticien."
- Token déjà complété → message "Ce questionnaire a déjà été complété."
- Token valide → afficher le questionnaire

**Écran d'introduction** :
- Logo IT2P
- Titre + préambule + instructions (voir INTRO_TEXT section 4)
- Bouton "Commencer la passation"
- Coming Soon : emplacement timer "30:00" affiché mais statique

**Questionnaire** (une question par écran) :
- Header : barre de progression (ex: "Question 5 / 14") + progress bar visuelle
- Coming Soon : timer placeholder en haut à droite
- Question : texte de la question en gros
- Options : boutons radio stylisés (cards cliquables), un par option
- Si la question a un lexique : icône "?" ou lien "Lexique" qui ouvre un panneau/tooltip avec les définitions
- Navigation : bouton "Précédent" (sauf Q1), bouton "Suivant" (désactivé tant qu'aucune réponse sélectionnée)
- Sur "Suivant" : envoie la réponse à l'API (upsert), passe à la question suivante
- Sur la dernière question : le bouton devient "Terminer"

**Écran de fin** :
- Icône de validation (check)
- "Merci, vos réponses ont été enregistrées."
- "Votre praticien vous contactera pour vous présenter vos résultats."
- Pas de lien, pas de résultat affiché
- Coming Soon : mention "Bientôt : possibilité de recevoir un résumé par email"

---

## 8. API Routes

### 8.1 Auth

**`POST /api/auth/login`**
```typescript
// Body: { email: string, password: string }
// Compare avec les variables d'env PRACTITIONER_EMAIL et PRACTITIONER_PASSWORD
// Si OK : crée un cookie de session (signé, httpOnly) + retourne { success: true, practitioner: { id, name, email } }
// Si KO : retourne 401 { error: "Identifiants incorrects" }
```

**`POST /api/auth/logout`**
```typescript
// Supprime le cookie de session
// Retourne { success: true }
```

### 8.2 Sessions (authentifié)

**`GET /api/sessions`**
```typescript
// Retourne la liste des sessions du praticien connecté
// Inclut le résultat si la session est COMPLETED
// Tri par date de création décroissante
// Response: Session[] (avec result: Result | null)
```

**`POST /api/sessions`**
```typescript
// Body: { coacheeName?: string, context?: string }
// Crée une session avec :
//   - token: uuid v4
//   - expiresAt: now + 48h
//   - status: "PENDING"
// Retourne la session créée avec le lien complet
// Response: { session: Session, link: string }
```

**`GET /api/sessions/[id]`**
```typescript
// Retourne le détail d'une session avec ses réponses et son résultat
// Vérification que la session appartient au praticien connecté
// Response: Session (avec answers: Answer[], result: Result | null)
```

### 8.3 Passation (publique)

**`GET /api/test/[token]`**
```typescript
// Vérifie la validité du token
// Retourne les questions + les réponses déjà données (pour reprise)
// Response: {
//   valid: boolean,
//   reason?: "NOT_FOUND" | "EXPIRED" | "COMPLETED",
//   questions?: Question[],       // Si valide
//   existingAnswers?: Record<number, string>  // Réponses déjà enregistrées
// }
```

**`POST /api/test/[token]/answer`**
```typescript
// Body: { question: number, answer: string }
// Upsert la réponse (crée ou met à jour)
// Met le status à "IN_PROGRESS" si c'est la première réponse
// Validation : question entre 1-14, answer est une lettre valide pour cette question
// Response: { success: true }
```

**`POST /api/test/[token]/complete`**
```typescript
// Vérifie que les 14 questions ont une réponse
// Exécute computeScores() avec les réponses
// Crée le Result en base
// Met le status à "COMPLETED" + completedAt = now
// Response: { success: true }
```

---

## 9. Charte graphique

### 9.1 Direction artistique

Sobre, professionnel, fiable. On respecte l'identité IA2P (tons sable/beige) tout en modernisant. Pas de fantaisie, pas de gradients clinquants. L'outil doit inspirer confiance aux praticiens (psychologues, coachs, RH).

### 9.2 Couleurs

```css
:root {
  --color-bg:          #FAFAF7;  /* Blanc cassé — fond principal */
  --color-surface:     #FFFFFF;  /* Blanc — cards, modals */
  --color-sand:        #D4C5A9;  /* Sable IA2P — accents, en-têtes */
  --color-sand-light:  #F5EBD8;  /* Sable clair — fonds secondaires */
  --color-text:        #2D2A26;  /* Noir chaud — texte principal */
  --color-text-secondary: #6B6560; /* Gris chaud — texte secondaire */
  --color-accent:      #2E5A88;  /* Bleu professionnel — boutons, liens */
  --color-accent-hover:#1D4A75;  /* Bleu foncé — hover */
  --color-coming-soon: #C8C4BE;  /* Gris clair — éléments désactivés */
  --color-success:     #4A7C59;  /* Vert doux — statut complété */
  --color-warning:     #B8860B;  /* Or — statut en attente */
  --color-error:       #A04040;  /* Rouge doux — erreurs */
  --color-info:        #4A6FA5;  /* Bleu clair — statut en cours */
}
```

### 9.3 Typographie (Google Fonts)

```css
/* Titres / Headings */
font-family: 'Playfair Display', serif;

/* Corps / UI / Boutons */
font-family: 'Source Sans 3', sans-serif;

/* Code profil / données techniques */
font-family: 'JetBrains Mono', monospace;
```

### 9.4 Composant Coming Soon

Un composant réutilisable qui encapsule n'importe quel élément :

```tsx
// components/ComingSoon.tsx
interface ComingSoonProps {
  children: React.ReactNode;
  label?: string; // Texte alternatif, défaut: "Bientôt disponible"
}

// Rendu : overlay semi-transparent + badge "Coming Soon" + children grisé + cursor not-allowed
// Le children est rendu mais non interactif (pointer-events: none, opacity: 0.5)
```

---

## 10. Seed de la base de données

Créer un script `prisma/seed.ts` qui :

1. Crée le praticien de démo :
```typescript
{
  email: "demo@solydev.fr",
  name: "Dr. Dunet (Démo)",
  company: "Institut IA2P"
}
```

2. Crée 2-3 sessions d'exemple avec des statuts variés pour que le dashboard ne soit pas vide :
- 1 session COMPLETED avec des réponses et un résultat calculé (pour montrer la roue)
- 1 session PENDING (pour montrer un lien en attente)
- 1 session EXPIRED (pour montrer le statut expiré)

---

## 11. Déploiement Lightsail

### 11.1 Architecture

```
┌─────────────────────────────┐
│     AWS Lightsail           │
│     Container Service       │
│                             │
│  ┌───────────────────────┐  │
│  │   Docker Container    │  │
│  │                       │  │
│  │   Next.js App         │  │
│  │   + SQLite (volume)   │  │
│  │   + Prisma            │  │
│  │                       │  │
│  │   Port 3000           │  │
│  └───────────────────────┘  │
│                             │
│  HTTPS via Lightsail        │
│  domaine temporaire         │
└─────────────────────────────┘
```

### 11.2 Variables d'environnement

```env
DATABASE_URL="file:./data/it2p.db"
PRACTITIONER_EMAIL="demo@solydev.fr"
PRACTITIONER_PASSWORD="demo2026"
PRACTITIONER_NAME="Dr. Dunet (Démo)"
SESSION_SECRET="[random-32-char-string]"
NEXT_PUBLIC_APP_URL="https://[lightsail-domain]"
```

### 11.3 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Créer le répertoire pour SQLite
RUN mkdir -p /app/data

ENV DATABASE_URL="file:./data/it2p.db"
ENV NODE_ENV=production

# Migrations + seed au démarrage
CMD npx prisma migrate deploy && npx prisma db seed && npm start

EXPOSE 3000
```

---

## 12. Arborescence complète du projet

```
it2p-prototype/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── fonts/          # Si nécessaire pour les fonts
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout racine + Google Fonts + Tailwind
│   │   ├── page.tsx                # Redirect → /login ou /dashboard
│   │   ├── globals.css             # Variables CSS + styles globaux
│   │   ├── login/
│   │   │   └── page.tsx            # Page de login
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Layout avec sidebar
│   │   │   ├── page.tsx            # Liste des sessions
│   │   │   └── session/
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Détail session + résultat + roue
│   │   ├── test/
│   │   │   └── [token]/
│   │   │       └── page.tsx        # Tunnel de passation complet (intro + questions + fin)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── sessions/
│   │       │   ├── route.ts        # GET list + POST create
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET detail
│   │       └── test/
│   │           └── [token]/
│   │               ├── route.ts        # GET validate token
│   │               ├── answer/
│   │               │   └── route.ts    # POST save answer
│   │               └── complete/
│   │                   └── route.ts    # POST finalize
│   ├── components/
│   │   ├── RoueA2P.tsx             # Composant SVG de la roue (voir section 6)
│   │   ├── Questionnaire.tsx       # Composant questionnaire step-by-step
│   │   ├── QuestionCard.tsx        # Affichage d'une question + options
│   │   ├── SessionCard.tsx         # Card session dans le dashboard
│   │   ├── SessionCreateModal.tsx  # Modal de création de session
│   │   ├── ComingSoon.tsx          # Badge/overlay Coming Soon
│   │   ├── StatusBadge.tsx         # Badge de statut (couleur selon état)
│   │   ├── LexiqueTooltip.tsx      # Tooltip/panneau pour le lexique
│   │   ├── ProgressBar.tsx         # Barre de progression du questionnaire
│   │   └── CopyLinkButton.tsx      # Bouton copier le lien avec feedback
│   ├── lib/
│   │   ├── prisma.ts               # Client Prisma singleton
│   │   ├── scoring.ts              # Algorithme de scoring (voir section 5)
│   │   ├── questions.ts            # Données du questionnaire (voir section 4)
│   │   └── auth.ts                 # Helpers auth (cookie, middleware)
│   └── middleware.ts               # Middleware Next.js pour protéger /dashboard/*
├── .env.example
├── Dockerfile
├── docker-compose.yml              # Pour dev local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 13. Éléments Coming Soon — récapitulatif complet

| Fonctionnalité | Emplacement dans l'UI | Type d'affichage |
|----------------|----------------------|------------------|
| Export PDF du bilan | `/dashboard/session/[id]` — sous la roue | Bouton grisé "Exporter en PDF" + badge Coming Soon |
| Textes descriptifs des 62 profils (5 variantes) | `/dashboard/session/[id]` — section profil | Encadré grisé avec texte placeholder lorem |
| Option analyse Soc/Psy | `/dashboard/session/[id]` — toggle | Toggle désactivé + badge Coming Soon |
| Personnalisation praticien (logo, raison sociale) | Sidebar dashboard | Section grisée "Personnalisation" |
| Gestion abonnement / facturation Stripe | Sidebar dashboard | Lien grisé "Mon abonnement" |
| Administration IA2P (gestion users, contenus) | Sidebar dashboard | Lien grisé "Administration" |
| Bilan collectif | Dashboard — header ou sidebar | Bouton grisé "Bilan collectif" |
| Timer 30 minutes | Tunnel de passation — header | Emplacement visible avec "30:00" statique et grisé |
| Bilingue FR/EN | Header global ou footer | Sélecteur de langue "FR \| EN" grisé |
| Saisie manuelle des réponses papier | Dashboard — actions | Bouton grisé "Saisie manuelle" |
| Accessibilité RGAA 4.1.2 | Footer global | Mention texte "Accessibilité : en cours de conformité RGAA" |
| Chiffrement AES des données | Non visible — mentionné dans footer/CGU | Texte "Sécurité : chiffrement AES prévu" |
| Hébergement France | Non visible — mentionné dans footer | Texte "Hébergement France prévu pour la production" |

---

## 14. Scénario de démonstration

Script pour la démo au client Sébastien Dunet :

1. **Ouvrir** `https://[domain]/login` — se connecter avec `demo@solydev.fr` / `demo2026`
2. **Dashboard** — montrer les sessions d'exemple (1 complétée, 1 en attente, 1 expirée)
3. **Cliquer sur la session complétée** — montrer la roue A2P avec le point focal, les scores
4. **Montrer les "Coming Soon"** — texte du profil, export PDF, Soc/Psy, etc.
5. **Revenir au dashboard** — créer une nouvelle session "Démo live"
6. **Copier le lien** — l'ouvrir dans un navigateur incognito
7. **Passer le questionnaire** — montrer le tunnel (intro, questions une par une, lexique, progression)
8. **Terminer** — voir le message de confirmation côté coaché
9. **Revenir au dashboard** — la session est maintenant "Terminée"
10. **Voir le résultat** — la roue A2P est générée avec les scores

**Points à souligner pendant la démo** :
- "On a bien compris que le coaché ne voit pas ses résultats"
- "Le lien est éphémère et expire après 48h"
- "Toutes les fonctionnalités du brief sont identifiées et prévues" (montrer les Coming Soon)
- "La stack est prête pour la production : Next.js + PostgreSQL + Stripe"
- "L'algorithme officiel sera branché dès que l'IA2P nous fournit la grille"
