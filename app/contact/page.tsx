import type { Metadata } from "next";
import { ContactExperience } from "../components/ContactExperience";
import { HeaderColorController } from "../components/HeaderColorController";

export const metadata: Metadata = {
  title: "Contact — Behsse",
  description:
    "Démarrer un projet, réserver un créneau téléphonique, ou récupérer mon adresse email.",
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
