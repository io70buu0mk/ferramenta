
import { Hammer, Wrench } from "lucide-react";

export default function ContattiFerramenta() {
  return (
    <section
      id="contatti"
      className="section-transparent w-full py-14 px-5 border-t border-cemento/20 texture-overlay"
    >
      <div className="max-w-2xl mx-auto card-blocco flex flex-col items-center text-center animate-fade-in">
        <h2 className="font-oswald text-2xl md:text-3xl font-bold text-verdesalvia mb-3 font-header flex items-center gap-3">
          <Hammer size={26} className="text-ruggine icon-glow animate-breathing" />
          <span className="bg-gradient-to-r from-verdesalvia to-ruggine bg-clip-text text-transparent">
            Contattaci
          </span>
        </h2>
        <div className="text-cemento text-lg font-lato mb-4 leading-relaxed">
          <div className="font-semibold text-antracite mb-1">Ferramenta Lucini Srl</div>
          Via degli Artigiani 14, Como (CO)
        </div>
        <div className="flex flex-col gap-4 items-center mt-4">
          <div className="flex items-center text-antracite bg-gradient-to-r from-sabbia/50 to-bianco/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover-3d">
            <Wrench className="mr-2 text-senape icon-glow" size={20} />
            <a
              href="mailto:info@ferramentalucini.it"
              className="text-ruggine hover:text-senape transition-colors font-medium"
            >
              info@ferramentalucini.it
            </a>
          </div>
          <div className="flex items-center text-antracite bg-gradient-to-r from-sabbia/50 to-bianco/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover-3d">
            <Hammer className="mr-2 text-verdesalvia icon-glow" size={20} />
            <span className="font-medium">031 1234567</span>
          </div>
        </div>
      </div>
    </section>
  );
}
