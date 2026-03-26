import { motion } from "framer-motion";
import { CreditCard, Download, BarChart3 } from "lucide-react";

const steps = [
  { icon: CreditCard, number: "01", title: "Realize o Pagamento", description: "Escolha o plano e finalize a compra de forma segura. O processo leva menos de 2 minutos." },
  { icon: Download, number: "02", title: "Baixe o Extrator", description: "Após a confirmação do pagamento, o download do arquivo é liberado automaticamente." },
  { icon: BarChart3, number: "03", title: "Extraia Seus Leads", description: "Execute a ferramenta, defina seus filtros e exporte leads qualificados instantaneamente." },
];

const ease = [0.16, 1, 0.3, 1] as const;

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="font-mono-data text-xs font-medium uppercase tracking-widest text-accent">Como funciona</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                className="font-mono-data text-5xl font-bold text-border"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.12 + 0.1 }}
              >
                {step.number}
              </motion.span>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
