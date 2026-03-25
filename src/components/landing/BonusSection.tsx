import { Gift, FileText, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const bonuses = [
  {
    tag: "BÔNUS #1",
    icon: FileText,
    title: "Guia Anti-Ban WhatsApp",
    value: "R$ 97,00",
    description:
      "Guia completo com técnicas comprovadas para proteger seu número de WhatsApp ao fazer prospecção em massa. Evite banimentos e mantenha sua conta segura.",
    items: [
      "Como evitar ser detectado como spam",
      "Intervalos ideais entre mensagens",
      "Técnicas de aquecimento de conta",
      "O que fazer se for bloqueado",
    ],
  },
  {
    tag: "BÔNUS #2",
    icon: MessageSquare,
    title: "3 Scripts de Vendas",
    value: "R$ 147,00",
    description:
      "3 scripts de vendas de alta conversão prontos para usar com seus leads extraídos. Aumente suas taxas de conversão desde o primeiro contato.",
    items: [
      "Script de primeiro contato (quebra-gelo)",
      "Script de follow-up (reengajamento)",
      "Script de fechamento (conversão)",
      "Técnicas de persuasão comprovadas",
    ],
  },
];

const BonusSection = () => {
  return (
    <section
      className="border-t px-6 py-16 md:py-20"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
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
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#f59e0b",
            }}
          >
            🎁 BÔNUS EXCLUSIVOS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f0f4ff" }}>
            Receba 2 Bônus de Alto Valor
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: "hsl(220 15% 55%)" }}>
            Além do Lead Extractor, você recebe gratuitamente 2 guias em PDF que vão turbinar seus
            resultados e proteger seu negócio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {bonuses.map((bonus, i) => (
            <motion.div
              key={bonus.tag}
              className="rounded-xl p-8 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,212,255,0.15)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "border-color 0.3s",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              whileHover={{ borderColor: "rgba(0,212,255,0.3)" }}
            >
              <div
                className="absolute top-0 right-0 text-xs font-bold px-4 py-1 rounded-bl-lg"
                style={{ background: "#00d4ff", color: "#000" }}
              >
                {bonus.tag}
              </div>

              <div className="flex items-center gap-4 mb-4 mt-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: "rgba(0,212,255,0.10)", color: "#00d4ff" }}
                >
                  <bonus.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "#f0f4ff" }}>
                    {bonus.title}
                  </h3>
                  <p className="text-sm font-semibold" style={{ color: "#10b981" }}>
                    Valor: {bonus.value}
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed" style={{ color: "hsl(220 15% 55%)" }}>
                {bonus.description}
              </p>

              <ul className="space-y-2 text-sm">
                {bonus.items.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "#10b981", marginTop: "2px" }}>✓</span>
                    <span style={{ color: "hsl(220 15% 65%)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          <div
            className="inline-flex flex-col items-center gap-2 rounded-xl px-8 py-6"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6" style={{ color: "#10b981" }} />
              <div className="text-left">
                <p className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>
                  Valor Total dos Bônus:
                </p>
                <p className="text-3xl font-bold" style={{ color: "#f0f4ff" }}>
                  R$ 244,00
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#10b981" }}>
              GRÁTIS ao adquirir o Lead Extractor hoje!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BonusSection;
