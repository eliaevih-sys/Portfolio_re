# DESIGN.md

Règles de design du portfolio d’Elia Evih. Extraites des corrections de la session du 2026-11-19. À lire avant toute modification d’interface.

## Color

- **L’identité repose sur `--cobalt: #0037FF`, `--ink: #101218` et `--ivory: #f7f5ee`. Les bandeaux utilisent le bleu en aplat, jamais en dégradé.**
  Why: une seule couleur signature rend la page reconnaissable ; le dégradé est un raccourci visuel qui dilue l’identité.
  <!-- 2026-11-19: « en te basant sur le site … en gardant le style https://edithbrou.com/ » ; « pas de gradients bleus/violets partout » -->

- **Toutes les couleurs viennent des tokens déclarés dans `:root` de `style.css` ; aucune valeur hexadécimale en dur dans le reste de la feuille.**
  Why: une couleur en dur échappe au système et crée des nuances concurrentes.
  <!-- 2026-11-19: correction des valeurs héritées `#d9d5cb`, `#1a1c20`, `#4e4d47` et `#fff` vers les tokens. Le lavis de survol utilise `--cobalt-wash`. Vérifié par `node tools/check-design.mjs`. -->

## Typography

- **Le display est `Barlow Condensed`, les accents `Instrument Serif`, le texte `Manrope`. Les bandeaux sont en condensed majuscule, presque pleine largeur.**
  Why: le condensé permet une typographie géante sans casser la ligne, ce qui fait le caractère éditorial de la référence.
  <!-- 2026-11-19: « garder le style https://edithbrou.com/ » -->

## Spacing & layout

- **Un seul coin arrondi : `border-radius: 0 var(--radius-one) 0 0` sur les médias. Les boutons sont des pilules à `border: 3px solid currentColor`, fond transparent.**
  Why: la répétition d’un seul geste géométrique crée une signature ; les contours légers laissent respirer la couleur.
  <!-- 2026-11-19: « garder le style https://edithbrou.com/ ». Vérifié par `node tools/check-design.mjs`. -->

- **Ne pas aligner trois cartes de taille identique, ni recourir à un gabarit de template générique. Utiliser des modules asymétriques et des tailles contrastées. Pour une liste de projets, employer l’index typographique `.index` avec panneau de prévisualisation, jamais une grille de cartes.**
  Why: la répétition mécanique fait reconnaître le gabarit avant le contenu ; l’index donne à chaque projet une ligne lisible et un statut explicite.
  <!-- 2026-11-19: « éviter les templates génériques, trois cartes identiques ». Le manifeste utilise depuis une liste en escalier (`.principles`) avec numéros outline et décalages progressifs. -->

- **Ne pas représenter les projets sous forme de dashboard.**
  Why: un dashboard est un vocabulaire d’outil, pas de portfolio ; il déplace l’attention vers des chiffres plutôt que vers le travail.
  <!-- 2026-11-19: « pas de dashboards » -->

- **Le footer est un bloc de clôture cobalt plein format, après la section contact encre : une seule adresse email géante comme geste final, puis des métadonnées discrètes et un wordmark outlined ivoire. Pas de grille de liens ni de rangée d’icônes sociales.**
  Why: une clôture monochrome avec un seul geste typographique marque la fin de la lecture ; multiplier les colonnes et les pastilles sociales redonne l’aspect template que le reste de la page évite.
  <!-- 2026-11-19: « propose autre chose pour le footer ». Vérifié par `footer-check.mjs` : fond `rgb(0, 55, 255)`, email de 30 px à 320 px et 122 px à 1440 px, 2/1 colonnes, zéro débordement, focus ivoire, reduced motion sans translation. Le numéro de téléphone n'apparaît plus dans le footer (retrait de la colonne « Appeler » sur demande de l'utilisatrice le 2026-11-20). -->

## Motion

- **Aucune animation d’interface ne dépasse 300 ms ; les retours de pression sont de 100 à 160 ms. Jamais `ease-in`, jamais `transition: all`. Utiliser `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` et `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Le survol est conditionné à `@media (hover: hover) and (pointer: fine)`.**
  Why: `ease-in` retarde le premier mouvement, celui que l’utilisateur regarde ; un survol non filtré se déclenche au toucher. Ces valeurs sont celles du dépôt `emilkowalski/skills` demandé par l’utilisateur.
  <!-- 2026-11-19: « pas d’animation excessive » ; « regarde aussi les règles du dépôt git https://github.com/emilkowalski/skills ». Vérifié par `node tools/check-design.mjs`. -->

- **Une seule révélation par conteneur, avec un stagger court (0/55/95/145/190 ms). Pas de mouvement décoratif superflu. Seule exception : l’entrée du hero, vue une fois par visite, peut monter à 650 ms.**
  Why: le mouvement doit signaler une structure, pas devenir un bruit de fond ; l’entrée du hero est un moment marketing, pas une interaction répétée.
  <!-- 2026-11-19: « pas d’animation excessive » ; `.hero__signal` à 620 ms. -->

- **Aucun stagger sur les lignes de l’index projets : l’état actif est instantané (180 ms), piloté par le survol ou le focus. Le panneau de prévisualisation change par fondu, sans réorganiser la page.**
  Why: une liste parcourue souvent ne doit pas faire attendre ; le survol et le focus partagent le même état.
  <!-- 2026-11-19: règle des skills `animate` et `choreograph` du dépôt emilkowalski/skills. Le lavis `clip-path` et le repère `02 / 06` dans le panneau renforcent l'état actif sans déplacement de contenu. -->

## Interaction

- **Toute révélation au scroll observe un ancêtre pourvu d’une boîte mesurable. Ne jamais observer un parent en `display: contents`.**
  Why: `.hero__copy` est en `display: contents` sous 820 px ; l’`IntersectionObserver` n’y voit aucune surface et le H1 restait invisible.
  <!-- 2026-11-19: bug corrigé dans `script.js` après QA mobile. -->

## Copy

- **Distinguer explicitement académique / concept / déployé. Ne jamais inventer de compétence, projet, résultat, prix ou article.**
  Why: la crédibilité du portfolio repose sur des labels exacts — `L3 DAS — UVCI`, et des projets comme Mairie de Bonoua, Akwaba, CaféIvoire, SunGrid ou Nourrici présentés comme académiques ou concepts.
  <!-- 2026-11-19: « garder les labels académiques/concepts intacts ; aucun skill, projet, résultat, prix ou article inventé » -->

- **Ne pas afficher le numéro de téléphone dans le texte visible. WhatsApp reste un lien libellé « Écrire sur WhatsApp ».**
  Why: l'utilisatrice a demandé le retrait du numéro du footer (2026-11-20) puis de la section Contact (2026-11-20) ; le canal reste joignable sans exposer le numéro en clair.
  <!-- 2026-11-20: « retire mon contact dans la zone appeler du footer » ; « la section 9 contact il y a mon numero qui est affiche au niveau de whatssapp ». -->
