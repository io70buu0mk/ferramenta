
import { Hammer } from "lucide-react";

export default function ChiSiamoFerramenta() {
  return (
    <section
      className="section-opaque w-full py-14 px-5 border-b border-cemento/30"
      id="chi-siamo"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 animate-fade-in">
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-antracite mb-4 flex gap-3 items-center font-header">
            <Hammer size={32} className="text-verdesalvia icon-glow animate-breathing"  />
            <span className="bg-gradient-to-r from-antracite to-verdesalvia bg-clip-text text-transparent">
              Chi siamo
            </span>
          </h2>
          <p className="text-cemento text-lg md:text-xl font-lato mb-3 leading-relaxed">
            Dal 1964, Ferramenta Lucini è il negozio che parla la lingua dei professionisti e degli appassionati: qui trovi chi conosce il mestiere, i materiali e la vita di cantiere.
          </p>
          <p className="text-verdesalvia text-lg md:text-xl font-lato leading-relaxed">
            Siamo una famiglia di artigiani: da tre generazioni tramandiamo non solo attrezzi solidi, ma anche consigli sinceri e un servizio che resta umano.
          </p>
        </div>
        <div className="animate-float" style={{ animationDelay: '1s' }}>
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
            alt="Laboratorio ferramenta"
            className="rounded-2xl shadow-2xl border-2 border-senape/50 bg-sabbia hidden md:block max-w-xs bordo-lamiera hover-3d"
          />
        </div>
      </div>
    </section>
  );
}
