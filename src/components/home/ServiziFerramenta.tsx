
import { Truck, Hammer, Wrench, ShieldCheck } from "lucide-react";

const servizi = [
  {
    icon: Truck,
    title: "Consegne rapide",
    desc: "Direttamente sul cantiere o in officina, in 24/48h.",
    tone: "verdesalvia",
    gradient: "from-verdesalvia/20 to-verdesalvia/10",
  },
  {
    icon: ShieldCheck,
    title: "Prodotti robusti",
    desc: "Solo marchi affidabili, scelti per resistere a lungo.",
    tone: "cemento",
    gradient: "from-cemento/20 to-cemento/10",
  },
  {
    icon: Hammer,
    title: "Supporto tecnico",
    desc: "Hai bisogno di consigli pratici? Siamo qui.",
    tone: "ruggine",
    gradient: "from-ruggine/20 to-ruggine/10",
  },
  {
    icon: Wrench,
    title: "Consulenza sincera",
    desc: "Ti aiutiamo a scegliere davvero quello che serve.",
    tone: "senape",
    gradient: "from-senape/20 to-senape/10",
  },
];

export default function ServiziFerramenta() {
  return (
    <section className="section-opaque w-full py-12 border-b border-cemento/30">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-4 grid-cols-1 gap-8">
        {servizi.map((s, index) => (
          <div
            key={s.title}
            className={`flex flex-col items-center text-center py-8 px-4 card-blocco animate-fade-in group relative overflow-hidden`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
            <div className="relative z-10">
              <s.icon 
                size={40} 
                className={`mb-3 text-${s.tone} icon-glow transition-all duration-300 group-hover:scale-110`} 
              />
              <div className={`font-oswald font-semibold mb-2 text-xl text-${s.tone} font-header transition-all duration-300 group-hover:text-${s.tone}`}>
                {s.title}
              </div>
              <div className="text-cemento text-sm font-lato font-light leading-relaxed">
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
