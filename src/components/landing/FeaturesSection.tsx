import { Database, Zap, Shield, FileSpreadsheet, RefreshCw, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: UserCheck,
    title: "Intervalos Humanos Inteligentes",
    description:
      "Sistema simula comportamento humano com delays naturais entre ações, protegendo seu número de WhatsApp e evitando bloqueios do Google Maps.",
    highlight: true,
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
  },
  {
    icon: Zap,
    title: "Extração em Tempo Real",
    description:
      "Veja os leads aparecendo na tela conforme são extraídos, com feedback visual instantâneo do progresso.",
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.10)",
  },
  {
    icon: Database,
    title: "Dados Completos",
    description:
      "Nome, telefone, site, endereço, nota e comentários — todos os campos que você precisa para prospecção.",
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.10)",
  },
  {
    icon: FileSpreadsheet,
    title: "Exportação CSV/Excel",
    description:
      "Arquivo pronto para importar no seu CRM, planilha ou ferramenta de automação de WhatsApp.",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
  },
  {
    icon: Shield,
    title: "Sem Duplicatas",
    description:
      "Sistema inteligente remove automaticamente leads duplicados, garantindo lista limpa e única.",
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.10)",
  },
  {
    icon: RefreshCw,
    title: "Atualizações Incluídas",
    description:
      "Receba todas as atualizações futuras da ferramenta sem custo adicional. Pagamento único, acesso vitalício.",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative border-t px-6 py-24 md:py-32 overflow-hidden"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "radial-gradient(ellipse 60% 50% at 100% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)",
      }}
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-16 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span
            className="font-mono-data text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00d4ff" }}
          >
            Recursos
          </span>
          <h2
            className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#f0f4ff" }}
          >
            Tudo que você precisa para gerar leads qualificados.
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group rounded-xl p-6"
              style={{
                background: feature.highlight
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(255,255,255,0.03)",
                border: feature.highlight
                  ? "1px solid rgba(16,185,129,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "all 0.3s",
              }}
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
            >
              {feature.highlight && (
                <div
                  className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "#10b981", color: "#000" }}
                >
                  🛡️ PROTEÇÃO INCLUÍDA
                </div>
              )}
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-md"
                style={{ background: feature.iconBg, color: feature.iconColor }}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: "#f0f4ff" }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 15% 55%)" }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
