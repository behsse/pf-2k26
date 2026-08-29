/** The questions asked on the home page, and the answers a visitor reads before
 * deciding to write. Kept out of the component so the page can also publish
 * them as FAQPage structured data: a client component cannot emit that block
 * from the server render, and duplicating the copy in two files would let the
 * answer shown and the answer indexed drift apart. */
export const FAQ_ITEMS = [
  {
    question: "Comment se déroule un projet avec toi ?",
    answer:
      "Process simple en 4 étapes : brief et échange sur tes besoins, proposition de direction (maquette/branding), validation avant développement, puis livraison. Tu es tenu au courant à chaque étape.",
  },
  {
    question: "Combien de temps pour un site ?",
    answer:
      "Compte 1 à 2 semaines pour un projet standard. Le délai précis est toujours confirmé au devis, selon la complexité et le projet.",
  },
  {
    question: "Combien de retouches sont incluses ?",
    answer:
      "2 séries de retouches sont incluses dans chaque projet. Au-delà, les ajustements supplémentaires sont facturés en plus.",
  },
  {
    question: "Qui détient le code et le design après livraison ?",
    answer:
      "Une fois le paiement complet effectué, le code et les fichiers de design t'appartiennent entièrement.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "40% d'acompte au démarrage puis 60% avant la livraison. Pas de mauvaise surprise en cours de route.",
  },
  {
    question: "Que se passe-t-il si je veux arrêter en cours de route ?",
    answer:
      "L'acompte n'est pas remboursable, et le travail déjà réalisé est facturé au prorata. Ça protège les deux parties.",
  },
  {
    question: "Le site est-il livré avec formation ou documentation ?",
    answer:
      "Oui. Une session de passation et un petit guide te sont fournis pour gérer ton site en autonomie après la livraison.",
  },
  {
    question: "Proposes-tu de la maintenance après le lancement ?",
    answer:
      "Oui, en option. Un abonnement mensuel est disponible pour les correctifs et évolutions après mise en ligne.",
  },
]
