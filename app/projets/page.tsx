import { Footer } from "../components/Footer";
import { HeaderColorController } from "../components/HeaderColorController";
import { ProjectLab } from "../components/ProjectLab";

export default function ProjetsPage() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-black">
      <HeaderColorController />
      <ProjectLab />
      <Footer />
    </div>
  );
}
