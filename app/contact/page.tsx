import type { Metadata } from "next";
import { ContactExperience } from "../components/ContactExperience";
import { HeaderColorController } from "../components/HeaderColorController";
import { pageOpenGraph } from "../lib/site";

export const metadata: Metadata = {
  title: "Contact | Démarrer un projet web",
  description:
    "Parlons de votre projet : quelques questions pour cadrer le besoin, puis un créneau téléphonique ou un email. Réponse rapide, sans engagement.",
  keywords: [
    "contacter un développeur web freelance",
    "devis site internet",
    "démarrer un projet web",
  ],
  alternates: { canonical: "/contact" },
  openGraph: pageOpenGraph({
    url: "/contact",
    title: "Contact | Démarrer un projet web",
    description:
      "Quelques questions pour cadrer le besoin, puis un créneau téléphonique ou un email. Sans engagement.",
  }),
};

/** No Footer here, deliberately.
 *
 * The footer is `position: fixed` and needs a screen's worth of scroll room
 * below the content to be revealed at all — and this page locks to a single
 * viewport so the experience never scrolls away from the question being
 * answered. What the footer carries that matters on a contact page (the
 * privacy policy, the social links) is carried by the recap and confirmation
 * screens instead. */
export default function ContactPage() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-[#f2f2f2]">
      <HeaderColorController />
      <ContactExperience />
    </div>
  );
}
