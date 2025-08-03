
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
          45.286141, 10.263403
          <div className="text-xs text-cemento mt-1">
            <a href="https://maps.google.com/?q=45.286141,10.263403" target="_blank" rel="noopener noreferrer" className="underline text-verdesalvia">Apri su Google Maps</a>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center mt-4">
          <div className="flex items-center text-antracite bg-gradient-to-r from-sabbia/50 to-bianco/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover-3d">
            <Wrench className="mr-2 text-senape icon-glow" size={20} />
            <a
              href="mailto:ferramenta.lucini@gmail.com"
              className="text-ruggine hover:text-senape transition-colors font-medium"
            >
              ferramenta.lucini@gmail.com
            </a>
          </div>
          <div className="flex items-center text-antracite bg-gradient-to-r from-sabbia/50 to-bianco/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover-3d">
            <Hammer className="mr-2 text-verdesalvia icon-glow" size={20} />
            <span className="font-medium">+39 389 982 2879</span>
          </div>
        </div>
      </div>
    </section>
  );
}
