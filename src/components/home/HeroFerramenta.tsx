
import { Hammer, Wrench } from "lucide-react";

export default function HeroFerramenta() {
  return (
    <section
      id="inizio"
      className="section-transparent w-full py-16 md:py-24 border-b border-sabbia/20 flex items-center justify-center texture-overlay animate-slide-in-elegant"
      style={{ minHeight: 430 }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center px-5">
        <div className="flex gap-4 mb-6 animate-floating-gentle">
          <Hammer
            size={52}
            strokeWidth={1.8}
            className="text-verdesalvia drop-shadow-2xl -rotate-12 animate-icon-spin-gentle"
            style={{ animationDelay: '0s' }}
          />
          <Wrench
            size={52}
            strokeWidth={1.8}
            className="text-senape drop-shadow-2xl rotate-6 animate-icon-spin-gentle"
            style={{ animationDelay: '1s' }}
          />
        </div>
        <h1 className="font-oswald text-5xl md:text-6xl font-bold text-sabbia mb-3 tracking-tight font-header animate-text-glow animate-scale-bounce">
          <span className="metallic-text drop-shadow-2xl">
            Ferramenta Lucini
          </span>
        </h1>
        <div className="w-20 mx-auto border-b-4 border-senape rounded-full mb-5 shadow-lg animate-pulse-golden animate-metallic-shine" />
        <p className="text-lg md:text-xl text-sabbia font-lato mb-4 max-w-2xl glass-effect py-6 px-8 rounded-2xl shadow-2xl backdrop-blur-md border border-sabbia/20 animate-slide-in-elegant animate-text-glow">
          Da 60 anni il tuo punto di riferimento: utensili scelti, consigli veri e materiali di cui fidarsi — con lo spirito autentico dell'officina.
        </p>
        <a
          href="#prodotti"
          className="btn-azione mt-3 animate-floating-gentle animate-pulse-golden smooth-hover"
          style={{ animationDelay: '2s' }}
        >
          Scopri i prodotti
        </a>
      </div>
    </section>
  );
}
