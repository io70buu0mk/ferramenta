
import { ShoppingCart, Hammer, Wrench } from "lucide-react";

const prodotti = [
  {
    nome: "Trapano Bosch Professional",
    descr: "Potente, affidabile — per fori netti su ferro e muratura.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    icona: <Wrench className="text-verdesalvia icon-glow" size={24} />,
    colore: "border-verdesalvia/50",
    gradiente: "from-verdesalvia/20 to-verdesalvia/10",
  },
  {
    nome: "Martello Stanley Fatmax",
    descr: "Testa in acciaio e manico antiscivolo, per durare e colpire.",
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80",
    icona: <Hammer className="text-ruggine icon-glow" size={24} />,
    colore: "border-ruggine/50",
    gradiente: "from-ruggine/20 to-ruggine/10",
  },
  {
    nome: "Set Cacciaviti Wera",
    descr: "Punta magnetica, presa robusta — precisi su ogni vite.",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    icona: <Wrench className="text-cemento icon-glow" size={24} />,
    colore: "border-cemento/50",
    gradiente: "from-cemento/20 to-cemento/10",
  },
  {
    nome: "Chiave Inglese Beta",
    descr: "Acciaio temprato made in Italy, presa sicura ovunque.",
    img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=400&q=80",
    icona: <Wrench className="text-antracite icon-glow" size={24} />,
    colore: "border-antracite/50",
    gradiente: "from-antracite/20 to-antracite/10",
  },
  {
    nome: "Metro Stanley Classic",
    descr: "Nastro antiruggine, precisione millimetrica garantita.",
    img: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=400&q=80",
    icona: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-senape icon-glow">
        <rect x="4" y="10" width="16" height="7" rx="2" fill="currentColor" />
        <rect x="6" y="5" width="12" height="5" rx="2" fill="#F4F1EA" />
      </svg>
    ),
    colore: "border-senape/50",
    gradiente: "from-senape/20 to-senape/10",
  },
];

export default function ProdottiConsigliati() {
  return (
    <section id="prodotti" className="section-transparent w-full py-16 px-5 border-b border-cemento/20 texture-overlay">
      <div className="max-w-6xl mx-auto flex flex-col items-start">
        <h2 className="font-oswald text-3xl md:text-4xl font-bold text-bianco mb-6 pl-1 font-header animate-fade-in">
          <span className="bg-gradient-to-r from-bianco via-sabbia to-senape bg-clip-text text-transparent drop-shadow-2xl">
            I nostri prodotti best-seller
          </span>
        </h2>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 w-full">
          {prodotti.map((p, index) => (
            <div
              key={p.nome}
              className={`card-prodotto group animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-t-2xl">
                <img
                  src={p.img}
                  alt={p.nome}
                  className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${p.gradiente} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="absolute top-3 right-3 p-2 bg-bianco/90 backdrop-blur-sm rounded-full shadow-lg">
                  {p.icona}
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col flex-1 h-full">
                <div className="flex items-center gap-3 font-bold text-xl mb-2 font-oswald text-verdesalvia">
                  {p.nome}
                </div>
                <div className="text-cemento text-sm font-lato font-light flex-1 mb-4 leading-relaxed">
                  {p.descr}
                </div>
                <button className="btn-azione flex items-center justify-center gap-2 mt-auto group">
                  <ShoppingCart size={18} className="transition-transform group-hover:scale-110" />
                  Aggiungi al carrello
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end w-full mt-12">
          <a
            href="/prodotti"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-bianco/95 to-bianco/90 backdrop-blur-lg border-2 border-senape/50 text-verdesalvia text-lg font-oswald px-8 py-3 rounded-2xl shadow-2xl hover-3d transition-all duration-300 group"
          >
            <ShoppingCart size={20} className="transition-transform group-hover:scale-110 icon-glow" />
            Vedi tutti i prodotti
          </a>
        </div>
      </div>
    </section>
  );
}
