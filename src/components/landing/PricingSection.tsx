import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

const benefits = [
  "🧠 IA avançada de detecção de leads qualificados",
  "⚡ Extração ultra-rápida (segundos, não minutos)",
  "🎯 Intervalos humanos inteligentes - Zero bloqueios",
  "📊 Dados completos: nome, telefone, email, site, endereço",
  "📁 Exportação multi-formato (CSV, Excel, JSON)",
  "🔒 Proteção total de dados e privacidade",
  "🔄 Atualizações vitalícias gratuitas",
  "🎯 Segmentação inteligente por filtros avançados",
  "💬 Suporte técnico prioritário",
  "📈 ROI garantido nas primeiras campanhas",
];

const ease = [0.16, 1, 0.3, 1] as const;

const PricingSection = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section
      id="pricing"
      className="border-t px-6 py-24 md:py-32"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,212,255,0.06) 0%, transparent 70%)",
      }}
    >
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span
            className="font-mono-data text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00d4ff" }}
          >
            Preço
          </span>
          <h2
            className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#f0f4ff" }}
          >
            Pagamento único. Acesso vitalício.
          </h2>
          <p className="mt-4" style={{ color: "hsl(220 15% 55%)" }}>
            Sem assinaturas, sem taxas mensais. Pague uma vez e tenha acesso completo ao extrator.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(0,212,255,0.25)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 60px rgba(0,212,255,0.08), 0 40px 80px rgba(0,0,0,0.4)",
          }}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
        >
          <div className="mb-6">
            <span
              className="font-mono-data text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#00d4ff" }}
            >
              Licença Completa
            </span>
            <div className="mt-3 flex items-baseline justify-center gap-1">
              <motion.span
                className="text-5xl font-extrabold tracking-tight"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.3 }}
              >
                R$ 1.000
              </motion.span>
              <span style={{ color: "hsl(220 15% 55%)" }}>,00</span>
            </div>
            <div
              className="mt-3 inline-block rounded-lg px-6 py-2"
              style={{ background: "linear-gradient(135deg,#0099cc,#00d4ff)" }}
            >
              <p className="text-xl font-bold uppercase tracking-wide text-black">
                💳 PAGAMENTO ÚNICO
              </p>
            </div>
            <p className="mt-2 text-sm" style={{ color: "hsl(220 15% 55%)" }}>
              Sem mensalidades. Sem taxas recorrentes. Acesso vitalício.
            </p>
          </div>

          <ul className="mb-8 space-y-3 text-left">
            {benefits.map((benefit, i) => (
              <motion.li
                key={benefit}
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.35 + i * 0.06 }}
              >
                <Check className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
                {benefit}
              </motion.li>
            ))}
          </ul>

          <button
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg,#0099cc,#00d4ff)",
              color: "#000",
              boxShadow: "0 0 30px rgba(0,212,255,0.3)",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setCheckoutOpen(true)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 50px rgba(0,212,255,0.5)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 30px rgba(0,212,255,0.3)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Comprar Agora
            <ArrowRight className="h-5 w-5" />
          </button>

          <div
            className="mt-4 rounded-xl p-4 flex items-center justify-center gap-2"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Shield className="h-4 w-4" style={{ color: "#10b981" }} />
            <p className="text-sm font-semibold" style={{ color: "#10b981" }}>
              Garantia de 7 dias ou seu dinheiro de volta
            </p>
          </div>

          <p className="mt-3 text-xs" style={{ color: "hsl(220 15% 45%)" }}>
            Pagamento seguro via PIX
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
