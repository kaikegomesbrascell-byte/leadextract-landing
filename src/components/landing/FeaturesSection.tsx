import { Database, Zap, Shield, FileSpreadsheet, RefreshCw, UserCheck, Brain, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "IA Avançada de Detecção",
    description:
      "Sistema inteligente identifica e extrai apenas contatos qualificados, eliminando dados irrelevantes automaticamente.",
    highlight: true,
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.12)",
  },
  {
    icon: Clock,
    title: "Extração Ultra Rápida",
    description:
      "Processa milhares de resultados em segundos com algoritmos otimizados e processamento paralelo.",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
  },
  {
    icon: UserCheck,
    title: "Intervalos Humanos Inteligentes",
    description:
      "Simula comportamento natural com delays variáveis, protegendo seu WhatsApp e evitando detecções.",
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.10)",
  },
  {
    icon: Database,
    title: "Dados Completos e Estruturados",
    description:
      "Nome, telefone, email, site, endereço, avaliação e comentários — tudo organizado para seu CRM.",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
  },
  {
    icon: FileSpreadsheet,
    title: "Exportação Multi-Formato",
    description:
      "CSV, Excel, JSON — escolha o formato ideal para integrar com suas ferramentas de automação.",
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.10)",
  },
  {
    icon: Shield,
    title: "Proteção Total de Dados",
    description:
      "Criptografia end-to-end e processamento local. Seus dados nunca saem do seu dispositivo.",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
  },
  {
    icon: RefreshCw,
    title: "Atualizações Vitalícias",
    description:
      "Receba todas as melhorias e novos recursos gratuitamente. Investimento único, benefícios eternos.",
    iconColor: "#00d4ff",
    iconBg: "rgba(0,212,255,0.10)",
  },
  {
    icon: Target,
    title: "Segmentação Inteligente",
    description:
      "Filtre leads por localização, avaliação, categoria e muito mais para campanhas ultra-direcionadas.",
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
