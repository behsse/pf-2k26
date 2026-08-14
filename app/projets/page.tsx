import { Footer } from "../components/Footer";
import { HeaderColorController } from "../components/HeaderColorController";

export default function ProjetsPage() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <HeaderColorController />
      <section className="relative z-10 flex min-h-dvh flex-col justify-center bg-white px-4 pt-28 pb-20 text-black md:px-8">
        <p className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
          Projets
        </p>
      </section>
      <Footer />
    </div>
  );
}
