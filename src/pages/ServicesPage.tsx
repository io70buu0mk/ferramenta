import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  ArrowLeft, 
  LogIn, 
  LogOut, 
  UserIcon, 
  Shield,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Calendar,
  Package
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { role, loading: roleLoading, isAdmin } = useUserRole(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const services = [
    {
      icon: Truck,
      title: "Consegna a Domicilio",
      description: "Consegniamo direttamente a casa tua o sul cantiere",
      features: [
        "Consegna gratuita per ordini superiori a €50",
        "Consegna in giornata per ordini entro le 14:00",
        "Servizio disponibile in tutta la provincia di Como",
        "Tracking in tempo reale del tuo ordine"
      ],
      highlight: true
    },
    {
      icon: Clock,
      title: "Servizio Express",
      description: "Per le tue urgenze, consegna entro 2 ore",
      features: [
        "Consegna garantita entro 2 ore",
        "Disponibile dal lunedì al sabato",
        "Costo aggiuntivo di €10",
        "Perfetto per emergenze di cantiere"
      ]
    },
    {
      icon: Calendar,
      title: "Consegna Programmata",
      description: "Pianifica la consegna quando ti è più comodo",
      features: [
        "Scegli data e ora di consegna",
        "Promemoria via SMS o email",
        "Flessibilità per riprogrammare",
        "Ideale per progetti programmati"
      ]
    }
  ];

  const deliveryZones = [
    { area: "Como Centro", time: "30-60 min", cost: "Gratuita sopra €50" },
    { area: "Provincia di Como", time: "1-2 ore", cost: "€5 sotto €50" },
    { area: "Cantieri locali", time: "Su appuntamento", cost: "Preventivo personalizzato" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Torna alla Home</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Truck size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-neutral-800">
                    I Nostri Servizi
                  </h1>
                  <p className="text-sm text-neutral-600 hidden sm:block">
                    Comodità e professionalità per ogni esigenza
                  </p>
                </div>
              </div>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  {roleLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl">
                      <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/cliente/${user.id}`)}
                        className="flex items-center gap-2"
                      >
                        <UserIcon size={16} />
                        <span className="hidden sm:inline">Area Cliente</span>
                      </Button>
                      
                      {isAdmin() && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/${user.id}`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
                        >
                          <Shield size={16} />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
                >
                  <LogIn size={16} />
                  <span>Accedi</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
            Consegna a Domicilio
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Ricevi i tuoi strumenti direttamente a casa o sul cantiere. 
            Veloce, sicuro e conveniente.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`bg-white/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-xl ${
                service.highlight 
                  ? 'border-amber-400 ring-2 ring-amber-400/20' 
                  : 'border-neutral-200/50'
              }`}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  service.highlight 
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                    : 'bg-neutral-100'
                }`}>
                  <service.icon size={32} className={service.highlight ? "text-white" : "text-neutral-600"} />
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                <p className="text-neutral-600">{service.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Zones */}
        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MapPin className="text-amber-500" />
              Zone di Consegna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {deliveryZones.map((zone, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-6">
                  <h4 className="font-semibold text-neutral-800 mb-3">{zone.area}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-neutral-500" />
                      <span className="text-sm text-neutral-600">{zone.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-neutral-500" />
                      <span className="text-sm text-neutral-600">{zone.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 mb-16">
          <CardHeader>
            <CardTitle>Come Funziona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Ordina", desc: "Scegli i prodotti e completa l'ordine online o per telefono" },
                { step: "2", title: "Conferma", desc: "Ricevi conferma dell'ordine e tempo di consegna stimato" },
                { step: "3", title: "Preparazione", desc: "Prepariamo con cura il tuo ordine nel nostro magazzino" },
                { step: "4", title: "Consegna", desc: "Consegniamo direttamente all'indirizzo indicato" }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <h4 className="font-semibold text-neutral-800 mb-2">{step.title}</h4>
                  <p className="text-sm text-neutral-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Hai Bisogno di Aiuto?</h3>
            <p className="mb-6 text-white/90">
              Il nostro team è sempre disponibile per aiutarti con i tuoi ordini e consegne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary"
                className="flex items-center gap-2 bg-white text-amber-600 hover:bg-neutral-50"
                onClick={() => window.location.href = 'tel:0311234567'}
              >
                <Phone size={18} />
                Chiama Ora
              </Button>
              <Button 
                variant="secondary"
                className="flex items-center gap-2 bg-white text-amber-600 hover:bg-neutral-50"
                onClick={() => window.location.href = 'mailto:info@ferramentalucini.it'}
              >
                <Mail size={18} />
                Invia Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-neutral-800">
            Cosa Dicono i Nostri Clienti
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marco R.",
                rating: 5,
                comment: "Servizio eccellente! La consegna è sempre puntuale e i prodotti arrivano in perfette condizioni."
              },
              {
                name: "Sara L.",
                rating: 5,
                comment: "Comodissimo il servizio di consegna a domicilio. Non devo più perdere tempo per andare in negozio."
              },
              {
                name: "Giuseppe M.",
                rating: 5,
                comment: "Per il mio cantiere è fondamentale avere consegne rapide. Non mi hanno mai deluso!"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-600 italic mb-4">"{testimonial.comment}"</p>
                  <p className="font-semibold text-neutral-800">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}