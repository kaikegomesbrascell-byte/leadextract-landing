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
            Escolha o plano ideal para você
          </h2>
          <p className="mt-4" style={{ color: "hsl(220 15% 55%)" }}>
            Planos mensais flexíveis. Cancele quando quiser.
          </p>
        </motion.div>

        {/* DOIS PLANOS LADO A LADO */}
        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* PLANO START - R$ 97/mês */}
          <motion.div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "2px solid rgba(0,212,255,0.5)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 0 60px rgba(0,212,255,0.2), 0 40px 80px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            {/* Badge de destaque */}
            <div className="absolute top-4 right-4">
              <div
                className="rounded-full px-3 py-1"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                  boxShadow: "0 0 20px rgba(0,212,255,0.5)",
                }}
              >
                <p className="text-xs font-bold uppercase text-black">Popular</p>
              </div>
            </div>

            <div className="mb-6">
              <span
                className="font-mono-data text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#00d4ff" }}
              >
                Plano Start
              </span>
              <div className="mt-3 flex items-baseline gap-1">
                <motion.span
                  className="text-5xl font-extrabold tracking-tight"
                  style={{ color: "#f0f4ff" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease, delay: 0.3 }}
                >
                  R$ 97
                </motion.span>
                <span style={{ color: "hsl(220 15% 55%)" }}>/mês</span>
              </div>
              <p className="mt-2 text-sm" style={{ color: "hsl(220 15% 55%)" }}>
                Ideal para começar. Cancele quando quiser.
              </p>
            </div>

            <ul className="mb-8 space-y-3 text-left">
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.35 }}
              >
                <Check className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
                50 Empresas Qualificadas/mês
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.4 }}
              >
                <Check className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
                Nome do Dono e Capital Social
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.45 }}
              >
                <Check className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
                Detecção Básica de Pixel/Ads
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.5 }}
              >
                <Check className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
                Exportação CSV/Excel
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.55 }}
              >
                <Check className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
                Suporte por email
              </motion.li>
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
              Quero Liberar Meus 50 Leads Agora
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="mt-3 text-xs text-center" style={{ color: "hsl(220 15% 45%)" }}>
              Pagamento seguro via PIX
            </p>
          </motion.div>

          {/* PLANO SOVEREIGN - R$ 1000/mês */}
          <motion.div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)",
              border: "2px solid rgba(139,92,246,0.5)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 0 60px rgba(139,92,246,0.3), 0 40px 80px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
          >
            {/* Badge VIP */}
            <div className="absolute top-4 right-4">
              <div
                className="rounded-full px-3 py-1"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  boxShadow: "0 0 20px rgba(139,92,246,0.5)",
                }}
              >
                <p className="text-xs font-bold uppercase text-white">VIP</p>
              </div>
            </div>

            <div className="mb-6">
              <span
                className="font-mono-data text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#8b5cf6" }}
              >
                Licença Sovereign 6.0
              </span>
              <div className="mt-3 flex items-baseline gap-1">
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
                <span style={{ color: "hsl(220 15% 55%)" }}>/mês</span>
              </div>
              <p className="mt-2 text-sm font-semibold" style={{ color: "#8b5cf6" }}>
                Exclusivo por Região
              </p>
            </div>

            <ul className="mb-8 space-y-3 text-left">
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.35 }}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#8b5cf6" }} />
                Extração Ilimitada
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.4 }}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#8b5cf6" }} />
                WhatsApp Direto dos Decisores
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.45 }}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#8b5cf6" }} />
                Auditoria Completa de Marketing
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.5 }}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#8b5cf6" }} />
                Garantia de Exclusividade Regional
              </motion.li>
              <motion.li
                className="flex items-center gap-3 text-sm"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.55 }}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#8b5cf6" }} />
                Suporte Prioritário VIP
              </motion.li>
            </ul>

            <a
              href="https://wa.me/5516994260416?text=Olá!%20Tenho%20interesse%20na%20Licença%20Sovereign%20do%20LeadExtract.%20Quero%20verificar%20se%20a%20minha%20região%20ainda%20está%20disponível%20para%20exclusividade."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(139,92,246,0.3)",
                border: "none",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 50px rgba(139,92,246,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 30px rgba(139,92,246,0.3)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Falar com Especialista no VIP
              <Zap className="h-5 w-5" />
            </a>

            <div
              className="mt-4 rounded-xl p-3 flex items-center justify-center gap-2"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <Shield className="h-4 w-4" style={{ color: "#8b5cf6" }} />
              <p className="text-xs font-semibold" style={{ color: "#8b5cf6" }}>
                Vagas limitadas por região
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
