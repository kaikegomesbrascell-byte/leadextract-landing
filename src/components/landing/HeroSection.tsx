import { Button } from "@/components/ui/button";
import { Download, ArrowRight, Sparkles, Target, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import LeadTablePreview from "./LeadTablePreview";
import { CheckoutModal } from "@/components/CheckoutModal";

const ease = [0.16, 1, 0.3, 1];

const HeroSection = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section
      className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24 md:pb-32"
      style={{
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.07) 0%, transparent 70%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(16,185,129,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Floating Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60"
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 opacity-50"
          animate={{
            y: [0, -30, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-40"
          animate={{
            y: [0, -15, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />

        <div className="mb-12 max-w-4xl md:mb-16">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="font-mono-data inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm"
                style={{
                  background: "rgba(0,212,255,0.10)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  color: "#00d4ff",
                  boxShadow: "0 0 20px rgba(0,212,255,0.1)",
                }}
              >
                <Sparkles className="h-3 w-3" />
                Tecnologia de Ponta
              </span>
              <span
                className="font-mono-data inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm"
                style={{
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#10b981",
                }}
              >
                <Target className="h-3 w-3" />
                Leads Qualificados
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ color: "#f0f4ff" }}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            Revolucione sua{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#00d4ff,#10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              prospecção B2B
            </span>{" "}
            com IA
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
            style={{ color: "hsl(220 15% 65%)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.25 }}
          >
            Extraia milhares de contatos qualificados do Google Maps em segundos.
            Nomes, emails, telefones e dados completos — tudo pronto para seu CRM e
            campanhas de WhatsApp automatizadas.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
          >
            <Button
              size="xl"
              className="group gap-3 font-bold text-black shadow-2xl transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#0099cc,#00d4ff)",
                boxShadow: "0 0 30px rgba(0,212,255,0.3), 0 4px 20px rgba(0,0,0,0.4)",
                border: "none",
              }}
              onClick={() => setCheckoutOpen(true)}
            >
              <TrendingUp className="h-5 w-5 transition-transform group-hover:scale-110" />
              Começar Agora - R$ 1.000
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              size="xl"
              variant="outline"
              asChild
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "#f0f4ff",
                background: "transparent",
              }}
            >
              <a href="#how-it-works">Como Funciona</a>
            </Button>

            <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(220 15% 60%)" }}>
              <Shield className="h-4 w-4" style={{ color: "#10b981" }} />
              <span>Pagamento único • Sem mensalidades • Suporte vitalício</span>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-12 flex flex-wrap items-center gap-6 text-sm"
            style={{ color: "hsl(220 15% 55%)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-400"></div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
              </div>
              <span>+500 empreendedores já transformaram seus negócios</span>
            </div>
          </motion.div>
        </div>

          <motion.div
            className="mt-8 flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { value: "2.847+", label: "leads por extração" },
              { value: "12s", label: "tempo médio" },
              { value: "CSV", label: "exportação direta" },
            ]
              .map((stat, i) => (
                <motion.div
                  key={stat.value}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.55 + i * 0.1 }}
                >
                  <span className="font-mono-data text-2xl font-bold" style={{ color: "#00d4ff" }}>
                    {stat.value}
                  </span>
                  <span className="text-xs" style={{ color: "hsl(220 15% 55%)" }}>
                    {stat.label}
                  </span>
                </motion.div>
              ))
              .reduce<React.ReactNode[]>((acc, el, i) => {
                if (i > 0)
                  acc.push(
                    <div
                      key={`sep-${i}`}
                      className="h-8 w-px"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    />
                  );
                acc.push(el);
                return acc;
              }, [])}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.5 }}
        >
          <LeadTablePreview />
        </motion.div>
    </section>
  );
};

export default HeroSection;
