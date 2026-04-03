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

export const INTRO_TEXT = {
  title: "Évaluation A2P — Analyse de Personnalité Professionnelle",
  preambule: "Le test A2P est le test de vos dispositions naturelles pour une profession. Il vous expliquera comment vous fonctionnez spontanément en situation de travail et, en conséquence il vous dira pour quels types d'études et de métiers vous serez le plus épanoui et performant.",
  instructions: "Le test A2P est un questionnaire, donc une série de questions. À chaque question, des réponses vous sont proposées. Il vous est demandé de choisir celle qui se rapproche le plus de votre sentiment. Il n'y a donc pas de bonnes ou de mauvaises réponses.\n\nSi aucune réponse ne convient parfaitement, choisissez celle qui se rapproche le plus de votre sentiment.\n\nSi, au contraire, vous hésitez entre 2 réponses qui vous paraîtraient aussi valables l'une que l'autre, n'en retenez qu'une, celle qui fera pencher la balance même s'il n'y a que quelques décigrammes de différence.\n\nDonc une seule réponse, mais toujours une réponse.\n\nVous prendrez pour répondre, tout le temps qu'il vous faudra.",
  startButton: "Bonne passation — Commencer"
};
