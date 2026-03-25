import { Shield, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const SmartIntervalsSection = () => {
  return (
    <section
      className="border-t px-6 py-16 md:py-20"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 70%)",
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
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#10b981",
            }}
          >
            🛡️ PROTEÇÃO PREMIUM
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f0f4ff" }}>
            Intervalos Humanos Inteligentes
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: "hsl(220 15% 55%)" }}>
            Tecnologia exclusiva que simula comportamento humano real, protegendo seu número de
            WhatsApp e garantindo extrações seguras sem bloqueios do Google Maps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Sem Proteção */}
          <motion.div
            className="rounded-xl p-6"
            style={{
              background: "rgba(244,63,94,0.04)",
              border: "1px solid rgba(244,63,94,0.2)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#f0f4ff" }}>
                Sem Proteção
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Extração rápida demais parece robô",
                "Google Maps detecta e bloqueia seu IP",
                "Seu WhatsApp pode ser banido por spam",
                "Dados incompletos ou incorretos",
                "Risco de perder sua conta comercial",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "hsl(220 15% 55%)" }}>
                  <span style={{ color: "#f43f5e", marginTop: "2px" }}>✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Com Proteção */}
          <motion.div
            className="rounded-xl p-6 relative overflow-hidden"
            style={{
              background: "rgba(16,185,129,0.04)",
              border: "1px solid rgba(16,185,129,0.25)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <div
              className="absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg"
              style={{ background: "#10b981", color: "#000" }}
            >
              INCLUÍDO
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
              >
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#f0f4ff" }}>
                Com Intervalos Inteligentes
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                ["Delays naturais entre cada ação (scroll, clique, leitura)", true],
                ["Comportamento humano simulado com variações aleatórias", true],
                ["Proteção do WhatsApp - evita banimento por spam", true],
                ["Sem bloqueios do Google Maps ou outras plataformas", true],
                ["Extração segura e confiável a longo prazo", true],
              ].map(([text]) => (
                <li key={text as string} className="flex items-start gap-2 text-sm" style={{ color: "#f0f4ff" }}>
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                  <span dangerouslySetInnerHTML={{ __html: (text as string).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff" }}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: "#f0f4ff" }}>
                  Por que isso vale R$ 1.000,00?
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(220 15% 55%)" }}>
                  Ferramentas baratas ou gratuitas extraem dados de forma agressiva, sem proteção.
                  Isso resulta em{" "}
                  <strong style={{ color: "#f0f4ff" }}>bloqueios do Google Maps</strong>,{" "}
                  <strong style={{ color: "#f0f4ff" }}>banimento do WhatsApp</strong> e{" "}
                  <strong style={{ color: "#f0f4ff" }}>perda de contas comerciais</strong>. Nosso
                  sistema com Intervalos Humanos Inteligentes protege seu investimento, garantindo
                  extrações seguras e sustentáveis.{" "}
                  <strong style={{ color: "#10b981" }}>
                    Você paga uma vez e usa para sempre, sem riscos.
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartIntervalsSection;
