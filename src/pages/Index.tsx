
import { ShoppingCart, MessageCircle, Users } from "lucide-react";

const bestSellers = [
  {
    name: "Trapano Bosch GSR 12V",
    desc: "Compatto, potente, perfetto per ogni esigenza domestica.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Martello Stanley Fatmax",
    desc: "Testa rinforzata, massimo comfort nel colpo.",
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Set cacciaviti Wera 7pz",
    desc: "Precisione tedesca, garantito a vita sul lavoro.",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
];

export default function Index() {
  return (
    <div className="max-w-7xl mx-auto py-2 px-2 animate-fade-in">
      <div className="bg-white rounded-xl shadow p-10 mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-[#b43434] mb-2 tracking-tight">
          Benvenuto su <span className="text-gray-900">FerramentaPro</span>
        </h1>
        <p className="text-lg text-gray-700 mb-5">
          Il punto di riferimento per professionisti e appassionati del fai-da-te!
        </p>
        <div className="flex flex-wrap gap-6 w-full justify-center mb-3">
          {bestSellers.map((item) => (
            <div
              key={item.name}
              className="w-72 bg-[#f4f4f6] rounded-lg overflow-hidden shadow hover:scale-105 transition-transform border border-gray-200"
            >
              <img src={item.img} className="w-full h-36 object-cover" alt="" />
              <div className="p-4">
                <div className="font-bold text-lg text-gray-900 mb-1">{item.name}</div>
                <div className="text-gray-600 text-sm mb-2">{item.desc}</div>
                <button className="bg-[#b43434] text-white px-4 py-2 rounded hover:bg-[#a32a2a] transition">Aggiungi al carrello</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <span className="inline-flex items-center gap-1 text-gray-700">
            <ShoppingCart size={20} className="text-[#b43434]" /> Spedizioni 24/48h
          </span>
          <span className="inline-flex items-center gap-1 text-gray-700">
            <MessageCircle size={20} className="text-[#b43434]" /> Assistenza clienti
          </span>
          <span className="inline-flex items-center gap-1 text-gray-700">
            <Users size={20} className="text-[#b43434]" /> Oltre 10,000 clienti
          </span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <section className="bg-white rounded-xl shadow p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[#b43434] mb-3">Chi siamo</h2>
          <p className="text-gray-700 text-base mb-4">
            Da oltre 25 anni selezioniamo utensili e prodotti per l’edilizia e l’industria. Passione, professionalità e servizio al cliente sono ciò che ci contraddistingue!  
            <br />Scopri la nostra ampia gamma di prodotti e la nostra assistenza sempre pronta ad aiutarti.
          </p>
        </section>
        <section className="bg-white rounded-xl shadow p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[#b43434] mb-3">Contatti</h2>
          <p className="text-gray-700 mb-2">
            Telefono: <span className="font-semibold">+39 0432 123456</span>
          </p>
          <p className="text-gray-700 mb-2">
            Email: <a href="mailto:info@ferramentapro.it" className="text-[#b43434] underline">info@ferramentapro.it</a>
          </p>
          <p className="text-gray-700 mb-2">
            Indirizzo: <span className="font-semibold">Via Utensili 10, Udine</span>
          </p>
        </section>
      </div>
      <div className="mt-10 md:mt-16">
        <PermessiRuoliTable />
      </div>
    </div>
  );
}

function PermessiRuoliTable() {
  const permessi = [
    {
      azione: "Visualizzare prodotti",
      Cliente: "✅",
      Moderato: "✅",
      Amministratore: "✅",
      "Super Amministratore": "✅",
    },
    {
      azione: "Aggiungi/modifica/rimuovi prodotti",
      Cliente: "❌",
      Moderato: "✅ (approvazione)",
      Amministratore: "✅",
      "Super Amministratore": "✅",
    },
    {
      azione: "Pubblica modifiche",
      Cliente: "❌",
      Moderato: "❌",
      Amministratore: "✅",
      "Super Amministratore": "✅",
    },
    {
      azione: "Modifica permessi",
      Cliente: "❌",
      Moderato: "❌",
      Amministratore: "❌",
      "Super Amministratore": "✅",
    },
    {
      azione: "Chat con clienti",
      Cliente: "✅ (con staff)",
      Moderato: "❌",
      Amministratore: "✅ (autorizzato)",
      "Super Amministratore": "✅",
    },
    {
      azione: "Chat staff interna",
      Cliente: "❌",
      Moderato: "✅",
      Amministratore: "✅",
      "Super Amministratore": "✅",
    },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-[#b43434] mb-3">Permessi & Ruoli</h3>
      <div className="overflow-x-auto">
        <table className="min-w-[550px] w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#f8e8e3] text-[#b43434]">
              <th className="py-2 px-3 rounded-l">Azione</th>
              <th className="py-2">Cliente</th>
              <th className="py-2">Moderato</th>
              <th className="py-2">Amministratore</th>
              <th className="py-2 rounded-r">Super Admin</th>
            </tr>
          </thead>
          <tbody>
            {permessi.map((r) => (
              <tr key={r.azione} className="bg-white border border-gray-200 text-center">
                <td className="py-2 px-3 text-left">{r.azione}</td>
                <td>{r.Cliente}</td>
                <td>{r.Moderato}</td>
                <td>{r.Amministratore}</td>
                <td>{r["Super Amministratore"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
