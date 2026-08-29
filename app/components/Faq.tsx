"use client"

import Link from "next/link"
import { useState } from "react"
import { FAQ_ITEMS } from "../data/faq"
import { RevealText } from "./RevealText"

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
