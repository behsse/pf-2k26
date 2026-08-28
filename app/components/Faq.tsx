"use client"

import Link from "next/link"
import { useState } from "react"
import { RevealText } from "./RevealText"

const FAQ_ITEMS = [
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

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-black/15">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-6 text-left cursor-pointer"
      >
        <span className="text-sm font-medium uppercase tracking-[0.04em] md:text-lg">
          <RevealText>{question}</RevealText>
        </span>
        <span
          aria-hidden="true"
          className={`relative h-3.5 w-3.5 shrink-0 transition-transform duration-300 md:h-4 md:w-4 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-black" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-black" />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 text-sm text-black/60 md:text-base">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      data-faq-section
      aria-labelledby="faq-title"
      className="relative z-20 bg-white px-4 pt-12 pb-28 md:px-8 md:pt-20 md:pb-40"
    >
      <div className="flex flex-col gap-12 md:flex-row md:gap-16">
        <div className="shrink-0 md:w-2/5">
          <p
            id="faq-title"
            className="text-4xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl"
          >
            <RevealText>FAQ</RevealText>
          </p>
          <div className="mt-8 text-sm text-black/60 md:mt-10">
            <p>
              <RevealText delay={0.1}>Tu ne trouves pas ta réponse ?</RevealText>
            </p>
            <Link
              href="mailto:behsse.pro@gmail.com"
              className="text-black underline underline-offset-4"
            >
              <RevealText delay={0.15}>Me contacter</RevealText>
            </Link>
          </div>
        </div>

        <div className="min-w-0 flex-1 border-t border-black/15 md:border-t-0">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
