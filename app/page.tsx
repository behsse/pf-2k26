import { HeaderColorController } from "./components/HeaderColorController";
import { HeroProjectTransition } from "./components/HeroProjectTransition";
import { Services } from "./components/Services";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <HeaderColorController />
      <HeroProjectTransition />
      <Services />
      <Faq />
      <Footer />
    </div>
  );
}
