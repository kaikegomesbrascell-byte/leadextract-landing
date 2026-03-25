import { Phone, Globe, MapPin, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const exampleLeads = [
  {
    name: "Sampa Sky",
    phone: "N/A",
    website: "www.sampasky.com.br",
    rating: "4.5",
    reviews: "277",
    address: "Praça Pedro Lessa, 110 - Centro Histórico de São Paulo, SP",
  },
  {
    name: "Ps Do Vidro",
    phone: "(11) 5555-6980",
    website: "www.psdovidro.com.br",
    rating: "4.5",
    reviews: "277",
    address: "R. Gomes de Carvalho, 477 - Vila Olímpia, São Paulo - SP",
  },
  {
    name: "VITEC VIDROS SÃO PAULO",
    phone: "(11) 2385-7785",
    website: "www.vitecvidros.ind.br",
    rating: "4.5",
    reviews: "277",
    address: "Rua Dr. Malta Cardoso, 397 - Vila Gumercindo, São Paulo - SP",
  },
  {
    name: "Ideia Glass",
    phone: "(11) 3016-9300",
    website: "www.ideiaglass.com.br",
    rating: "4.5",
    reviews: "277",
    address: "R. Treze de Maio, 911 - Bela Vista, São Paulo - SP",
  },
  {
    name: "Modular Vidros",
    phone: "(11) 3384-1371",
    website: "www.modularvidros.com.br",
    rating: "4.5",
    reviews: "277",
    address: "Av. Armando Ferrentini, 63 - LOJA 03 - Paraíso, São Paulo - SP",
  },
  {
    name: "Mirante Vidros - Vidraçaria",
    phone: "(11) 93000-8010",
    website: "www.mirantevidros.com.br",
    rating: "4.5",
    reviews: "277",
    address: "R. Tebas, 451 - Campo Belo, São Paulo - SP",
  },
];

const LeadsExampleSection = () => {
  return (
    <section
      className="border-t py-20 px-6"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 70%)",
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "#00d4ff",
            }}
          >
            Exemplo Real
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f0f4ff" }}>
            Veja Leads Reais Extraídos
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "hsl(220 15% 55%)" }}>
            Estes são exemplos reais de leads extraídos com a busca "Vidro" em "São Paulo". Total
            de 37 leads únicos extraídos em poucos minutos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {exampleLeads.map((lead, index) => (
            <motion.div
              key={index}
              className="rounded-xl p-5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "all 0.3s",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease, delay: index * 0.06 }}
              whileHover={{
                y: -3,
                borderColor: "rgba(0,212,255,0.2)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              }}
            >
              <div className="mb-3">
                <h3 className="text-base font-bold" style={{ color: "#f0f4ff" }}>
                  {lead.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                    <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
                      {lead.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" style={{ color: "hsl(220 15% 45%)" }} />
                    <span className="text-xs" style={{ color: "hsl(220 15% 50%)" }}>
                      {lead.reviews} avaliações
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#10b981" }} />
                  <span style={{ color: "hsl(220 15% 60%)" }}>{lead.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Globe className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#00d4ff" }} />
                  <span className="truncate" style={{ color: "#00d4ff" }}>
                    {lead.website}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "hsl(220 15% 45%)" }} />
                  <span className="line-clamp-2" style={{ color: "hsl(220 15% 55%)" }}>
                    {lead.address}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#10b981",
            }}
          >
            <span className="font-bold">✅ 37 leads únicos extraídos</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span>Sem duplicatas</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span>Dados completos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadsExampleSection;
