/**
 * Générateur des études de cas, des notes de laboratoire et des redirections.
 * Source de vérité unique pour les pages secondaires.
 *
 * Usage : node tools/build-cases.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const write = (p, s) => fs.writeFileSync(path.join(root, p), s, "utf8");

/* ---------- Blocs partagés extraits de l'accueil ---------- */
const index = read("index.html");

const between = (start, end) => {
  const a = index.indexOf(start);
  const b = index.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`Marqueur introuvable : ${start}`);
  return index.slice(a, b);
};

let navBlock = between("<!-- NAVIGATION -->", '<main id="main">');
let footerBlock = between(
  "<!-- ================= FOOTER ================= -->",
  "<!-- ================= DIALOGUES ================= -->"
);

navBlock = navBlock.replace(/href="#/g, 'href="index.html#');
footerBlock = footerBlock.replace(/href="#/g, 'href="index.html#');

const withActive = (block, anchor, label) =>
  block.replace(
    `<a href="index.html#${anchor}">${label}</a>`,
    `<a href="index.html#${anchor}" class="is-active" aria-current="location">${label}</a>`
  );

const shellTop = (title, description, activeAnchor, activeLabel) => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${esc(title)} — Elia Evih</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="theme-color" content="#f7f5ee" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(title)} — Elia Evih" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="assets/img/hero-elia-720.webp" />
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&amp;family=Instrument+Serif:ital@0;1&amp;family=Manrope:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
  <script>document.documentElement.classList.add('js');</script>
  <noscript><style>[data-reveal]{opacity:1!important;clip-path:none!important;transform:none!important}</style></noscript>
</head>
<body>
  <a class="skip-link" href="#main">Aller au contenu</a>
  <div class="scroll-progress" aria-hidden="true"></div>

${withActive(navBlock, activeAnchor, activeLabel)}
  <main id="main">
`;

const shellBottom = `
  </main>

${footerBlock}
  <script src="script.js"></script>
</body>
</html>
`;

/* ---------- Utilitaires ---------- */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function image(media, lazy = true) {
  return `<img src="${media.src}" srcset="${media.srcset}" sizes="${media.sizes || "100vw"}" width="${media.w}" height="${media.h}" alt="${esc(media.alt)}"${lazy ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async" />`;
}

const heroMedia = (c) => {
  if (c.hero.type === "phones") {
    return `<div class="case-phones" data-reveal>
      ${c.hero.images
        .map(
          (im) =>
            `<img src="${im.src}" width="${im.w}" height="${im.h}" alt="${esc(im.alt)}" loading="eager" decoding="async" />`
        )
        .join("\n      ")}
    </div>`;
  }

  return `<figure class="case-media" data-reveal>
      ${image(c.hero, false)}
      <figcaption><span>${esc(c.hero.url || "Interface")}</span><span>${esc(c.hero.caption)}</span></figcaption>
    </figure>`;
};

const gallery = (items = []) => {
  if (!items.length) return "";
  return `<div class="case-gallery case-gallery--${Math.min(items.length, 3)}" data-reveal>
      ${items
        .map(
          (im, i) => `<figure class="case-gallery__item">
        ${image(im)}
        <figcaption><span>${String(i + 2).padStart(2, "0")}</span>${esc(im.caption)}</figcaption>
      </figure>`
        )
        .join("\n      ")}
    </div>`;
};

const externalLink = (c) =>
  c.external
    ? `<a class="case-external" href="${esc(c.external.url)}" target="_blank" rel="noopener">${esc(c.external.label)} <span aria-hidden="true">↗</span></a>`
    : "";

/* ---------- Données des six études de cas ---------- */
const cases = [
  {
    file: "projet-mairie.html",
    num: "01",
    activeAnchor: "projets",
    activeLabel: "Projets",
    title: "Mairie de Bonoua",
    subtitle: "Portail citoyen & back-office municipal",
    description:
      "Étude de cas — digitalisation des services municipaux : parcours citoyen, back-office agent, Laravel, PHP et MySQL.",
    tag: "Projet fullstack",
    year: "2025",
    role: "Designer & développeuse full-stack",
    context: "Projet académique — UVCI",
    stack: "Laravel · PHP · MySQL · HTML/CSS · JavaScript",
    intro:
      "Concevoir une plateforme où un habitant peut déposer une demande sans se déplacer, et où un agent municipal peut la traiter avec un suivi clair. Le projet couvre la modélisation des données, les interfaces et le développement Laravel.",
    problem:
      "Les démarches administratives supposent souvent un déplacement et une file d'attente. Comment rendre le dépôt et le suivi d'une demande compréhensibles, pour le citoyen comme pour l'agent ?",
    problemNote:
      "Le projet est un exercice académique complet, pas une commande passée par la municipalité. Il sert à travailler un cas réel de bout en bout.",
    steps: [
      [
        "Modéliser avant d'écrire",
        "Structurer les demandes, les statuts et les pièces jointes dans une base MySQL cohérente, pour garantir un suivi lisible et une traçabilité des actions.",
      ],
      [
        "Deux interfaces, deux besoins",
        "Un portail citoyen simple pour déposer et suivre une demande. Un back-office agent plus dense pour consulter, traiter et faire avancer les dossiers.",
      ],
      [
        "Développer le parcours complet",
        "Implémenter la logique avec Laravel : authentification, gestion des fichiers, changements de statut et vues adaptées aux deux profils.",
      ],
    ],
    delivered: [
      "Portail citoyen de dépôt et de suivi des demandes",
      "Back-office agent pour le traitement des dossiers",
      "Base MySQL structurée et logique applicative Laravel",
      "Interfaces responsive pensées pour deux profils distincts",
    ],
    result:
      "Une application fonctionnelle et documentée, qui relie modélisation des données, design d'interfaces et développement back-end. Elle n'a pas été déployée pour la municipalité : sa valeur tient dans l'exercice complet qu'elle représente.",
    resultNote: "Projet académique — aucune donnée réelle de citoyens.",
    hero: {
      src: "assets/img/mairie-home-1800.webp",
      srcset:
        "assets/img/mairie-home-900.webp 900w, assets/img/mairie-home-1800.webp 1800w",
      w: 1800,
      h: 862,
      alt: "Page d'accueil de la plateforme de services de la Mairie de Bonoua",
      url: "Portail citoyen",
      caption: "Accueil — dépôt et suivi des demandes",
    },
    gallery: [
      {
        src: "assets/img/mairie-services-1800.webp",
        srcset:
          "assets/img/mairie-services-900.webp 900w, assets/img/mairie-services-1800.webp 1800w",
        w: 1800,
        h: 856,
        alt: "Page des e-services de la plateforme Mairie de Bonoua",
        caption: "Les e-services et leurs parcours",
      },
    ],
    next: { file: "projet-akwaba.html", name: "Akwaba Tech Institute" },
  },
  {
    file: "projet-akwaba.html",
    num: "02",
    activeAnchor: "projets",
    activeLabel: "Projets",
    title: "Akwaba Tech Institute",
    subtitle: "Vitrine institutionnelle & prototype Figma",
    description:
      "Étude de cas UI/UX — plateforme institutionnelle d'un institut de formation technologique : identité, design system et prototype interactif.",
    tag: "UI/UX & front-end",
    year: "2025",
    role: "UI/UX designer & intégratrice front-end",
    context: "Projet de conception",
    stack: "Figma · Design system · HTML/CSS · JavaScript",
    intro:
      "Donner à un institut de formation technologique une présence numérique crédible et désirable : une architecture claire pour les futurs étudiants, une identité forte et un prototype utilisable comme support de discussion.",
    problem:
      "Comment structurer une offre de formation sans noyer le visiteur, tout en donnant à l'institut une présence plus affirmée qu'une page institutionnelle standard ?",
    problemNote:
      "Le travail est resté au stade de la conception et du prototype ; aucune mise en ligne publique n'a été réalisée dans ce cadre.",
    external: {
      url: "https://www.figma.com/proto/piyTD4H7iowgP7xXbSsqla/Akwaba-tech?node-id=4-2&t=bofA0uPTdRyj4fS5-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=4%3A2",
      label: "Ouvrir le prototype Figma",
    },
    steps: [
      [
        "Clarifier le parcours candidat",
        "Identifier les questions qui précèdent une inscription : formations, admissions, débouchés, contact. Construire l'architecture autour de ces décisions.",
      ],
      [
        "Donner une voix à l'institut",
        "Travailler une direction artistique institutionnelle mais vivante, avec des composants modulaires et une hiérarchie typographique lisible.",
      ],
      [
        "Prototyper les pages clés",
        "Concevoir l'accueil, les formations et l'inscription sous Figma, avec un prototype interactif et une base d'intégration HTML/CSS.",
      ],
    ],
    delivered: [
      "Maquettes responsive des pages clés",
      "Design system et guide de style",
      "Prototype Figma cliquable",
      "Première base d'intégration front-end",
    ],
    result:
      "Un prototype cohérent et démontrable, pensé pour être testé, discuté et transmis à une équipe de développement. Le projet documente une démarche de conception, pas une plateforme publiée.",
    resultNote: "Projet de conception — prototype cliquable disponible.",
    hero: {
      src: "assets/img/akwaba-home-1601.webp",
      srcset:
        "assets/img/akwaba-home-900.webp 900w, assets/img/akwaba-home-1601.webp 1601w",
      w: 1601,
      h: 850,
      alt: "Page d'accueil du site Akwaba Tech Institute",
      url: "Akwaba Tech Institute",
      caption: "Accueil — une entrée institutionnelle assumée",
    },
    gallery: [
      {
        src: "assets/img/akwaba-2-832.webp",
        srcset: "assets/img/akwaba-2-832.webp 832w",
        w: 832,
        h: 811,
        alt: "Second écran du prototype Akwaba Tech Institute",
        caption: "Composants et déclinaison du design system",
      },
    ],
    next: { file: "projet-cafeivoire.html", name: "CaféIvoire" },
  },
  {
    file: "projet-cafeivoire.html",
    num: "03",
    activeAnchor: "projets",
    activeLabel: "Projets",
    title: "CaféIvoire",
    subtitle: "Application mobile & parcours d'achat",
    description:
      "Étude de cas mobile UI/UX — application e-commerce dédiée au café local, du catalogue au panier, prototypée dans Figma.",
    tag: "Mobile UI/UX",
    year: "2025",
    role: "Mobile UI/UX designer",
    context: "Projet de conception",
    stack: "Figma Mobile · Prototypage interactif · Design system",
    intro:
      "Concevoir une application mobile qui rend le café local simple à découvrir et agréable à commander. Un parcours complet, du catalogue au panier, pensé pour le téléphone avant tout.",
    problem:
      "Comment rendre l'achat de café local aussi simple qu'une commande familière, sans perdre la dimension artisanale et chaleureuse du produit ?",
    problemNote:
      "Le livrable est un prototype Figma interactif ; l'application n'a pas été développée ni publiée sur les stores.",
    external: {
      url: "https://www.figma.com/proto/4kFr2h7vVfYQ3ZLc1aoMHF/Mobile?node-id=52-951&p=f&t=3Q5x6ENOjO86y5AQ-1&scaling=scale-down&content-scaling=fixed&page-id=2%3A2&starting-point-node-id=52%3A951",
      label: "Ouvrir le prototype Figma",
    },
    steps: [
      [
        "Réduire les frictions du mobile",
        "Structurer un catalogue lisible, des fiches produit courtes et un panier accessible, avec des zones tactiles généreuses et des états explicites.",
      ],
      [
        "Créer une identité chaleureuse",
        "Travailler une palette de tons café, une typographie soignée et des composants d'interface simples, sans surcharge décorative.",
      ],
      [
        "Prototyper le parcours complet",
        "Relier les écrans clés dans Figma, avec transitions, états de chargement et gestion du panier pour tester le parcours de bout en bout.",
      ],
    ],
    delivered: [
      "Écrans mobile du catalogue au panier",
      "Design system et composants réutilisables",
      "Prototype Figma interactif de bout en bout",
      "Déclinaisons d'états pour les actions clés",
    ],
    result:
      "Un prototype mobile cohérent qui montre un parcours d'achat fluide et une identité de marque lisible. Il sert de base de discussion pour un développement futur, sans prétendre remplacer une application réelle.",
    resultNote: "Projet de conception — prototype Figma, non publié.",
    hero: {
      type: "phones",
      images: [
        {
          src: "assets/img/cafe-1-270.webp",
          w: 270,
          h: 783,
          alt: "Écran d'accueil de l'application CaféIvoire",
        },
        {
          src: "assets/img/cafe-2-272.webp",
          w: 272,
          h: 831,
          alt: "Écran de produit de l'application CaféIvoire",
        },
        {
          src: "assets/img/cafe-3-278.webp",
          w: 278,
          h: 782,
          alt: "Écran de panier de l'application CaféIvoire",
        },
      ],
    },
    gallery: [],
    next: { file: "projet-agrosmart.html", name: "AgroSmart" },
  },
  {
    file: "projet-agrosmart.html",
    num: "04",
    activeAnchor: "projets",
    activeLabel: "Projets",
    title: "AgroSmart",
    subtitle: "Application terrain & back-office agricole",
    description:
      "Étude de cas — solution agricole fullstack : interface d'administration web, application mobile terrain et base MySQL.",
    tag: "UI/UX & fullstack",
    year: "2024",
    role: "UI/UX designer & développeuse full-stack",
    context: "Projet produit — mis en ligne",
    stack: "Next.js · Node.js · MySQL · Figma",
    intro:
      "Relier le terrain et la gestion : une application mobile pour les agriculteurs, un back-office web pour les responsables, et une même donnée au centre. Le projet couvre le design et le développement de la solution.",
    problem:
      "Comment connecter des usages très différents — saisie rapide sur le terrain, analyse et administration au bureau — sans dupliquer l'information ni complexifier chaque écran ?",
    problemNote:
      "Le site est accessible en ligne. Les données et comptes de démonstration ne représentent pas des exploitations réelles.",
    external: {
      url: "https://agrosmart.voisilab.online",
      label: "Visiter la plateforme",
    },
    steps: [
      [
        "Séparer les rôles, unifier les données",
        "Concevoir deux parcours distincts : un agriculteur sur mobile, un administrateur sur le web. Les deux interfaces partagent la même structure de données.",
      ],
      [
        "Penser le terrain avant le tableau",
        "Privilégier des actions courtes, des formulaires tolérants et des indicateurs qui se lisent vite, y compris dans des conditions d'usage difficiles.",
      ],
      [
        "Développer et mettre en ligne",
        "Construire le front-end Next.js, l'API Node.js et la base MySQL, puis déployer une version accessible publiquement.",
      ],
    ],
    delivered: [
      "Back-office web Next.js pour le suivi des récoltes",
      "Parcours mobile pour la saisie terrain",
      "API Node.js et base MySQL structurée",
      "Mise en ligne d'une version fonctionnelle",
    ],
    result:
      "Une plateforme complète accessible en ligne, qui relie design d'interfaces et développement fullstack. Elle reste un projet produit : les données de démonstration et le périmètre fonctionnel sont limités.",
    resultNote: "Projet produit — version en ligne accessible.",
    hero: {
      src: "assets/img/agrosmart-dashboard-1433.webp",
      srcset:
        "assets/img/agrosmart-dashboard-900.webp 900w, assets/img/agrosmart-dashboard-1433.webp 1433w",
      w: 1433,
      h: 1600,
      alt: "Tableau de bord agricole de la solution AgroSmart",
      url: "agrosmart.voisilab.online",
      caption: "Tableau de bord — vision d'ensemble",
    },
    gallery: [
      {
        src: "assets/img/agrosmart-sensors-1600.webp",
        srcset:
          "assets/img/agrosmart-sensors-900.webp 900w, assets/img/agrosmart-sensors-1600.webp 1600w",
        w: 1600,
        h: 1431,
        alt: "Vue de supervision des capteurs dans AgroSmart",
        caption: "Supervision des capteurs",
      },
      {
        src: "assets/img/agrosmart-users-1600.webp",
        srcset:
          "assets/img/agrosmart-users-900.webp 900w, assets/img/agrosmart-users-1600.webp 1600w",
        w: 1600,
        h: 1280,
        alt: "Formulaire d'ajout d'utilisateur dans AgroSmart",
        caption: "Gestion des utilisateurs",
      },
    ],
    next: { file: "projet-sungrid.html", name: "SunGrid" },
  },
  {
    file: "projet-sungrid.html",
    num: "05",
    activeAnchor: "projets",
    activeLabel: "Projets",
    title: "SunGrid",
    subtitle: "Supervision solaire & hiérarchie de l'information",
    description:
      "Étude de cas UI/UX — plateforme de supervision de l'énergie solaire : tableaux de bord, cartographie et design system.",
    tag: "UI/UX Design",
    year: "2024",
    role: "UI/UX designer",
    context: "Exploration UI/UX",
    stack: "Figma · Design system · Dashboard UX",
    intro:
      "Rendre des métriques énergétiques complexes lisibles pour des opérateurs qui doivent décider vite. Une exploration de tableaux de bord solaires, de la hiérarchie des données aux composants réutilisables.",
    problem:
      "Quand une interface affiche beaucoup de mesures, tout finit par avoir la même importance. Comment organiser l'information pour que l'alerte, la tendance et le détail trouvent chacun leur place ?",
    problemNote:
      "Il s'agit d'une exploration de conception. La plateforme n'est pas un produit déployé et les visuels ne présentent pas de données réelles.",
    steps: [
      [
        "Hiérarchiser par décision",
        "Classer l'information selon l'action qu'elle déclenche : surveiller, comparer, intervenir. Chaque niveau garde un rôle distinct dans la page.",
      ],
      [
        "Construire un langage de données",
        "Concevoir des composants de graphiques, de statuts et de cartes réutilisables, lisibles sur fond clair comme sur fond sombre.",
      ],
      [
        "Tester la lecture des écrans",
        "Vérifier que les écrans restent compréhensibles à différentes densités, sans multiplier les couleurs ni les effets visuels.",
      ],
    ],
    delivered: [
      "Tableaux de bord hiérarchisés par criticité",
      "Composants de graphiques et de statuts",
      "Vue cartographique des installations",
      "Parcours opérateur centré sur la lecture rapide",
    ],
    result:
      "Une exploration de dashboard qui privilégie la décision plutôt que l'accumulation de widgets. Les écrans servent de base à une discussion produit, pas de preuve d'un déploiement.",
    resultNote: "Exploration UI/UX — visuels conceptuels, pas de données réelles.",
    hero: {
      src: "assets/img/sungrid-dashboard-1-1600.webp",
      srcset:
        "assets/img/sungrid-dashboard-1-900.webp 900w, assets/img/sungrid-dashboard-1-1600.webp 1600w",
      w: 1600,
      h: 1358,
      alt: "Tableau de bord de supervision énergétique SunGrid",
      url: "SunGrid",
      caption: "Vue agent — indicateurs et priorités",
    },
    gallery: [
      {
        src: "assets/img/sungrid-dashboard-2-1474.webp",
        srcset:
          "assets/img/sungrid-dashboard-2-900.webp 900w, assets/img/sungrid-dashboard-2-1474.webp 1474w",
        w: 1474,
        h: 1600,
        alt: "Seconde vue du tableau de bord SunGrid",
        caption: "Détail des installations",
      },
      {
        src: "assets/img/sungrid-map-1600.webp",
        srcset:
          "assets/img/sungrid-map-900.webp 900w, assets/img/sungrid-map-1600.webp 1600w",
        w: 1600,
        h: 1280,
        alt: "Carte des installations solaires dans SunGrid",
        caption: "Cartographie des sites",
      },
    ],
    next: { file: "projet-nourrici.html", name: "Nourrici" },
  },
  {
    file: "projet-nourrici.html",
    num: "06",
    activeAnchor: "projets",
    activeLabel: "Projets",
    title: "Nourrici",
    subtitle: "Marketplace alimentaire & espace utilisateur",
    description:
      "Étude de cas UI/UX — marketplace de produits alimentaires locaux : catalogue, fiches produit, panier et tableau de bord utilisateur.",
    tag: "UI/UX Design",
    year: "2024",
    role: "UI/UX designer",
    context: "Projet de conception",
    stack: "Figma · E-commerce · Dashboard utilisateur",
    intro:
      "Concevoir une marketplace de produits alimentaires locaux qui inspire confiance, du premier catalogue jusqu'au panier. Une interface claire, cohérente et pensée pour des achats récurrents.",
    problem:
      "Comment rendre des produits locaux désirables et rassurants sur un écran, sans surcharger les fiches, et faire tenir ensemble catalogue, panier et espace client dans un même langage ?",
    problemNote:
      "Le livrable est une conception Figma. La marketplace n'a pas été développée ni ouverte au public.",
    steps: [
      [
        "Rendre le catalogue lisible",
        "Structurer les catégories, les filtres et les fiches produit autour des informations qui aident vraiment à choisir : origine, usage, prix, disponibilité.",
      ],
      [
        "Simplifier le panier",
        "Réduire le nombre d'étapes et rendre les quantités, les totaux et les actions suivantes immédiatement compréhensibles.",
      ],
      [
        "Unifier l'expérience",
        "Construire un design system e-commerce commun au catalogue, au panier et au tableau de bord utilisateur.",
      ],
    ],
    delivered: [
      "Catalogue et fiches produit",
      "Parcours de panier simplifié",
      "Tableau de bord utilisateur",
      "Composants e-commerce réutilisables",
    ],
    result:
      "Une conception de marketplace cohérente, qui montre comment un design system peut tenir ensemble les différents moments d'un parcours d'achat. Elle reste une base de conception, pas une boutique en ligne.",
    resultNote: "Projet de conception — maquettes Figma, non développées.",
    hero: {
      src: "assets/img/nourrici-dashboard-1600.webp",
      srcset:
        "assets/img/nourrici-dashboard-900.webp 900w, assets/img/nourrici-dashboard-1600.webp 1600w",
      w: 1600,
      h: 1531,
      alt: "Tableau de bord utilisateur de la marketplace Nourrici",
      url: "Nourrici",
      caption: "Espace utilisateur — commandes et suivi",
    },
    gallery: [
      {
        src: "assets/img/nourrici-catalog-1298.webp",
        srcset:
          "assets/img/nourrici-catalog-900.webp 900w, assets/img/nourrici-catalog-1298.webp 1298w",
        w: 1298,
        h: 1600,
        alt: "Catalogue de produits alimentaires Nourrici",
        caption: "Catalogue et filtres",
      },
      {
        src: "assets/img/nourrici-product-1181.webp",
        srcset:
          "assets/img/nourrici-product-900.webp 900w, assets/img/nourrici-product-1181.webp 1181w",
        w: 1181,
        h: 1600,
        alt: "Fiche produit de la marketplace Nourrici",
        caption: "Fiche produit",
      },
      {
        src: "assets/img/nourrici-cart-1242.webp",
        srcset:
          "assets/img/nourrici-cart-900.webp 900w, assets/img/nourrici-cart-1242.webp 1242w",
        w: 1242,
        h: 1600,
        alt: "Panier de la marketplace Nourrici",
        caption: "Panier et récapitulatif",
      },
    ],
    next: { file: "projet-mairie.html", name: "Mairie de Bonoua" },
  },
];

/* ---------- Rendu des études de cas ---------- */
function renderCase(c) {
  return `${shellTop(
    `${c.title} — ${c.subtitle}`,
    c.description,
    c.activeAnchor,
    c.activeLabel
  )}
    <article class="case-page">
      <div class="shell">
        <a href="index.html#projets" class="case-back"><span aria-hidden="true">←</span> Tous les projets</a>

        <header class="case-head" data-reveal>
          <div class="case-head__meta">
            <span>Étude de cas ${c.num}</span>
            <span>${esc(c.tag)}</span>
            <span>${esc(c.year)}</span>
          </div>
          <h1 class="case-head__title">${esc(c.title)}<span class="title-dot" aria-hidden="true"></span></h1>
          <div class="case-head__bottom">
            <p class="case-head__subtitle">${esc(c.subtitle)}</p>
            <p class="case-head__intro">${esc(c.intro)}</p>
          </div>
          ${externalLink(c)}
        </header>

        ${heroMedia(c)}
        ${gallery(c.gallery)}

        <dl class="case-facts" data-reveal>
          <div><dt>Année</dt><dd>${esc(c.year)}</dd></div>
          <div><dt>Rôle</dt><dd>${esc(c.role)}</dd></div>
          <div><dt>Cadre</dt><dd>${esc(c.context)}</dd></div>
          <div><dt>Stack &amp; outils</dt><dd>${esc(c.stack)}</dd></div>
        </dl>

        <section class="case-chapter" data-reveal>
          <p class="case-chapter__label">Le point de départ</p>
          <div class="case-chapter__body">
            <p class="case-chapter__lead">« ${esc(c.problem)} »</p>
            <p class="case-chapter__note">${esc(c.problemNote)}</p>
          </div>
        </section>

        <section class="case-chapter" data-reveal>
          <p class="case-chapter__label">La démarche</p>
          <div class="case-chapter__body">
            <div class="case-steps">
              ${c.steps
                .map(
                  (step, i) => `<div class="case-step">
                <span class="case-step__num">${String(i + 1).padStart(2, "0")}</span>
                <h2>${esc(step[0])}</h2>
                <p>${esc(step[1])}</p>
              </div>`
                )
                .join("\n              ")}
            </div>
          </div>
        </section>

        <div class="case-outcome" data-reveal>
          <section class="case-deliver">
            <p class="case-chapter__label">Ce qui a été livré</p>
            <ul>
              ${c.delivered.map((item) => `<li>${esc(item)}</li>`).join("\n              ")}
            </ul>
          </section>
          <section class="case-result">
            <p class="case-chapter__label">Le résultat, sans exagérer</p>
            <p>${esc(c.result)}</p>
            <p class="case-result__note">${esc(c.resultNote)}</p>
          </section>
        </div>

        <a href="${c.next.file}" class="case-next">
          <span class="case-next__meta">Étude de cas suivante</span>
          <span class="case-next__title">${esc(c.next.name)}</span>
          <span class="case-next__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
${shellBottom}`;
}

cases.forEach((c) => write(c.file, renderCase(c)));

/* ---------- Données des explorations du laboratoire ---------- */
const conceptVisuals = {
  vision360: `<div class="lab-visual lab-visual--vision concept-cover__art">
          <span class="vision__ring vision__ring--1" aria-hidden="true"></span>
          <span class="vision__ring vision__ring--2" aria-hidden="true"></span>
          <span class="vision__ring vision__ring--3" aria-hidden="true"></span>
          <span class="vision__cross" aria-hidden="true"></span>
          <span class="vision__word" aria-hidden="true">360<span>°</span></span>
          <span class="vision__meta">Visite immersive<br />Territoires &amp; récits</span>
          <span class="vision__status">Concept</span>
        </div>`,
  tradIvoire: `<div class="lab-visual lab-visual--trad concept-cover__art">
          <span class="trad__word">FR</span>
          <span class="trad__bridge" aria-hidden="true"><i></i><span>↔</span><i></i></span>
          <span class="trad__word">CI</span>
          <span class="trad__meta">Langues · contextes · nuances</span>
          <span class="trad__status">Concept</span>
        </div>`,
  meteoIot: `<div class="lab-visual lab-visual--meteo concept-cover__art">
          <span class="meteo__sun" aria-hidden="true"></span>
          <span class="meteo__rain" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span class="meteo__word" aria-hidden="true">MÉTÉO</span>
          <div class="meteo__bars" aria-hidden="true"><i style="--h: 34%"></i><i style="--h: 58%"></i><i style="--h: 44%"></i><i style="--h: 72%"></i><i style="--h: 51%"></i><i style="--h: 86%"></i><i style="--h: 63%"></i></div>
          <span class="meteo__meta">Capteurs · température · pluie</span>
          <span class="meteo__status">Concept</span>
        </div>`,
  aboure: `<div class="lab-visual lab-visual--aboure concept-cover__art">
          <span class="aboure__letter" aria-hidden="true">A</span>
          <span class="aboure__paths" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="aboure__meta">Écouter · répéter · se souvenir</span>
          <span class="aboure__status">Concept</span>
        </div>`,
};

const explorations = [
  {
    file: "laboratoire-vision360.html",
    num: "01",
    visual: "vision360",
    title: "Vision360",
    tagline: "Voir un lieu comme un récit, pas comme une galerie.",
    description:
      "Exploration UI/UX — Vision360, une piste d'interface immersive pour découvrir un lieu autrement. Concept en réflexion, non déployé.",
    intro:
      "Vision360 est une piste d'interface immersive pour découvrir un lieu autrement. Pas une galerie de photos : un récit spatial où le regard devient navigation.",
    hypothesis: [
      "Sur le web, un lieu se découvre souvent dans une grille d'images. On regarde beaucoup, on comprend peu. Vision360 part d'une question simple : et si le déplacement dans une image pouvait raconter quelque chose ?",
      "L'idée n'est pas d'ajouter de la 3D partout, mais de choisir un mode de lecture : entrer par un détail, suivre une lumière, écouter une voix. La technologie doit servir le récit, pas devenir le sujet.",
    ],
    intentions: [
      "Concevoir une navigation qui se comprend sans tutoriel.",
      "Prévoir une alternative accessible, sans 3D, pour le contenu essentiel.",
      "Relier chaque image à un fragment de contexte, pas seulement à une légende.",
    ],
    questions: [
      "Comment guider sans flèches visibles, tout en restant prévisible ?",
      "Quel niveau de fidélité visuelle est nécessaire pour que le lieu reste crédible ?",
      "Qui écrit le récit d'un lieu : le designer, le visiteur, l'habitant ?",
    ],
    limits: [
      "Un produit de visite virtuelle finalisé.",
      "Une étude utilisateur ou un partenariat avec un lieu.",
    ],
    status:
      "Concept en réflexion — aucun lieu partenaire, aucun prototype 3D réalisé.",
    next: { file: "laboratoire-tradivoire.html", name: "TradIvoire" },
  },
  {
    file: "laboratoire-tradivoire.html",
    num: "02",
    visual: "tradIvoire",
    title: "TradIvoire",
    tagline: "Traduire le contexte, pas seulement les mots.",
    description:
      "Exploration éditoriale — TradIvoire, une réflexion sur la traduction et les nuances entre le français et les langues ivoiriennes. Concept non déployé.",
    intro:
      "TradIvoire est une réflexion éditoriale sur la traduction entre le français et les langues ivoiriennes. Son point de départ : les mots seuls ne suffisent pas.",
    hypothesis: [
      "Une traduction juste ne consiste pas à remplacer un mot par un autre. Il y a le contexte, le ton, l'oralité, ce qui ne se dit pas de la même manière selon la langue.",
      "TradIvoire explore une plateforme où la traduction serait accompagnée : une nuance, une situation, une note de contexte. Une manière de rendre la différence visible sans la folkloriser.",
    ],
    intentions: [
      "Faire de la nuance une partie de l'expérience, pas une note cachée.",
      "Prévoir la validation par des personnes qui parlent réellement la langue.",
      "Penser d'abord l'oralité et l'usage, avant le dictionnaire.",
    ],
    questions: [
      "Qui valide une traduction, et comment rendre ce processus transparent ?",
      "Comment montrer qu'une langue ne se traduit pas toute seule ?",
      "Quelle place pour l'oralité dans une interface principalement textuelle ?",
    ],
    limits: [
      "Un service de traduction automatique opérationnel.",
      "Un corpus linguistique validé ou un partenariat culturel.",
    ],
    status:
      "Concept en réflexion — aucun corpus validé, aucun service en ligne.",
    next: { file: "laboratoire-meteoiot.html", name: "MeteoIot" },
  },
  {
    file: "laboratoire-meteoiot.html",
    num: "03",
    visual: "meteoIot",
    title: "MeteoIot",
    tagline: "La météo qui vient du sol.",
    description:
      "Exploration data & IoT — MeteoIot, une interface pour transformer des mesures de capteurs en décisions lisibles. Concept non déployé.",
    intro:
      "MeteoIot explore une interface qui transforme des mesures de capteurs en informations utiles. Pas une accumulation de chiffres : un outil pour décider.",
    hypothesis: [
      "Une station météo ne sert pas seulement à afficher une température. Elle sert à savoir quand irriguer, quand couvrir, quand prévenir. La valeur est dans la décision, pas dans le graphique.",
      "L'exploration part du terrain : des capteurs peu bavards, une connexion instable, des personnes qui n'ont pas le temps de lire un dashboard. L'interface doit rester lisible quand tout le reste ne l'est pas.",
    ],
    intentions: [
      "Hiérarchiser les mesures selon l'action qu'elles permettent.",
      "Rendre visible l'état du capteur et la fiabilité de la donnée.",
      "Concevoir une vue mobile utilisable dehors, en plein soleil.",
    ],
    questions: [
      "Quelle donnée est vraiment utile, et laquelle rassure seulement ?",
      "Comment distinguer une alerte réelle d'une panne de capteur ?",
      "Quel niveau de détail garder pour ne pas noyer l'essentiel ?",
    ],
    limits: [
      "Une station météo déployée ou un réseau de capteurs.",
      "Des données réelles et des alertes opérationnelles.",
    ],
    status:
      "Concept en réflexion — aucun capteur déployé, aucune donnée réelle utilisée.",
    next: { file: "laboratoire-aboure.html", name: "Abouré" },
  },
  {
    file: "laboratoire-aboure.html",
    num: "04",
    visual: "aboure",
    title: "Abouré",
    tagline: "Une langue se transmet, elle ne se télécharge pas.",
    description:
      "Exploration langue & pédagogie — Abouré, un carnet d'apprentissage pour écouter, répéter et transmettre. Concept non déployé.",
    intro:
      "Abouré est une exploration de carnet d'apprentissage pour écouter, répéter et transmettre une langue. Un objet numérique qui laisse de la place à l'oralité et au temps.",
    hypothesis: [
      "Une langue ne se réduit pas à une liste de mots. Elle porte des intonations, des contextes, des manières de dire le lien entre les gens. Un écran peut faciliter la mémoire, pas remplacer la transmission.",
      "L'exploration cherche une progression douce : écouter, répéter, reconnaître, se souvenir. Une expérience humble, qui ne prétend pas enseigner à la place d'une personne qui parle la langue.",
    ],
    intentions: [
      "Commencer par l'écoute et la prononciation, avant la grammaire.",
      "Laisser une place à l'erreur, à la répétition et au rythme personnel.",
      "Prévoir un cadre de validation avec des locuteurs et des pédagogues.",
    ],
    questions: [
      "Comment respecter l'oralité dans un format numérique ?",
      "Quelle progression donne envie de revenir sans infantiliser ?",
      "Qui doit écrire et valider les contenus ?",
    ],
    limits: [
      "Une méthode d'apprentissage validée ou un dictionnaire.",
      "Un contenu linguistique produit sans locuteurs natifs.",
    ],
    status:
      "Concept en réflexion — aucun contenu linguistique validé, aucun locuteur partenaire.",
    next: { file: "laboratoire-vision360.html", name: "Vision360" },
  },
];

/* ---------- Rendu des explorations ---------- */
function renderConcept(c) {
  return `${shellTop(
    `${c.title} — Laboratoire`,
    c.description,
    "laboratoire",
    "Laboratoire"
  )}
    <article class="concept-page">
      <div class="shell">
        <a href="index.html#laboratoire" class="case-back"><span aria-hidden="true">←</span> Le laboratoire</a>

        <header class="concept-head" data-reveal>
          <p class="case-head__meta"><span>Exploration ${c.num}</span><span>Laboratoire</span><span>Concept</span></p>
          <h1 class="concept-head__title">${esc(c.title)}<span class="title-dot" aria-hidden="true"></span></h1>
          <p class="concept-head__tagline">${esc(c.tagline)}</p>
        </header>

        <figure class="concept-cover" data-reveal>
          ${conceptVisuals[c.visual]}
          <figcaption><span>Piste de réflexion</span><span>Maquette typographique — aucun déploiement</span></figcaption>
        </figure>

        <div class="concept-intro" data-reveal>
          <p class="concept-intro__lead">${esc(c.intro)}</p>
          <p class="concept-intro__status"><span class="square" aria-hidden="true"></span>${esc(c.status)}</p>
        </div>

        <dl class="case-facts" data-reveal>
          <div><dt>Nature</dt><dd>Exploration personnelle</dd></div>
          <div><dt>Statut</dt><dd>Concept — non déployé</dd></div>
          <div><dt>Rôle</dt><dd>Design produit &amp; réflexion</dd></div>
          <div><dt>Terrain</dt><dd>Design, code, données &amp; langues</dd></div>
        </dl>

        <section class="case-chapter" data-reveal>
          <p class="case-chapter__label">L'hypothèse</p>
          <div class="case-chapter__body">
            <p class="case-chapter__lead">${esc(c.hypothesis[0])}</p>
            <p class="case-chapter__note">${esc(c.hypothesis[1])}</p>
          </div>
        </section>

        <div class="concept-split" data-reveal>
          <section>
            <p class="case-chapter__label">Les intentions</p>
            <ul class="concept-intentions">
              ${c.intentions.map((item) => `<li><span aria-hidden="true"></span>${esc(item)}</li>`).join("\n              ")}
            </ul>
          </section>
          <section>
            <p class="case-chapter__label">Questions ouvertes</p>
            <ol class="concept-questions">
              ${c.questions.map((item) => `<li>${esc(item)}</li>`).join("\n              ")}
            </ol>
          </section>
        </div>

        <section class="concept-limit" data-reveal>
          <p class="case-chapter__label">Ce que ce n'est pas</p>
          <ul>
            ${c.limits.map((item) => `<li>${esc(item)}</li>`).join("\n            ")}
          </ul>
          <p>Présenter une exploration pour ce qu'elle est : une manière de chercher, pas une preuve de résultat.</p>
        </section>

        <a href="${c.next.file}" class="case-next">
          <span class="case-next__meta">Exploration suivante</span>
          <span class="case-next__title">${esc(c.next.name)}</span>
          <span class="case-next__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
${shellBottom}`;
}

explorations.forEach((c) => write(c.file, renderConcept(c)));

/* ---------- Redirections des anciennes URLs ---------- */
const redirects = [
  ["about.html", "index.html#profil", "Profil"],
  ["projets.html", "index.html#projets", "Projets"],
  ["certifications.html", "index.html#certifications", "Certifications"],
  ["contact.html", "index.html#contact", "Contact"],
];

redirects.forEach(([file, target, label]) => {
  write(
    file,
    `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta http-equiv="refresh" content="0; URL=${target}" />
  <link rel="canonical" href="index.html" />
  <title>${label} — Elia Evih</title>
</head>
<body style="background:#f7f5ee;color:#101218;font-family:system-ui,sans-serif;padding:2rem">
  <p>Cette page a été intégrée au portfolio. <a href="${target}" style="color:#0037ff">Accéder à la section ${label}</a>.</p>
  <script>location.replace("${target}");</script>
</body>
</html>
`
  );
});

console.log(
  `Généré : ${cases.length} études de cas, ${explorations.length} explorations et ${redirects.length} redirections.`
);
