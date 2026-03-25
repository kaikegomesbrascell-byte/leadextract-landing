import { motion } from "framer-motion";
import { CreditCard, Download, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    number: "01",
    title: "Realize o Pagamento",
    description: "Escolha o plano e finalize a compra de forma segura. O processo leva menos de 2 minutos.",
    color: "#00d4ff",
    shadow: "rgba(0,212,255,0.15)",
  },
  {
    icon: Download,
    number: "02",
    title: "Baixe o Extrator",
    description: "Após a confirmação do pagamento, o download do arquivo é liberado automaticamente.",
    color: "#10b981",
    shadow: "rgba(16,185,129,0.15)",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Extraia Seus Leads",
    description: "Execute a ferramenta, defina seus filtros e exporte leads qualificados instantaneamente.",
    color: "#a855f7",
    shadow: "rgba(168,85,247,0.15)",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="border-t px-6 py-24 md:py-32"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="mx-auto max-w-6xl">
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
            Como funciona
          </span>
          <h2
            className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#f0f4ff" }}
          >
            3 passos para começar a extrair.
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease, delay: i * 0.12 }}
            >
              <motion.span
                className="font-mono-data text-5xl font-bold"
                style={{ color: "rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.12 + 0.1 }}
              >
                {step.number}
              </motion.span>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-md"
                  style={{
                    background: `rgba(${step.color === "#00d4ff" ? "0,212,255" : step.color === "#10b981" ? "16,185,129" : "168,85,247"},0.12)`,
                    color: step.color,
                    boxShadow: `0 0 16px ${step.shadow}`,
                  }}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: "#f0f4ff" }}>
                  {step.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "hsl(220 15% 55%)" }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
