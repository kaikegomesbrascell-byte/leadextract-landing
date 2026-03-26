import { Button } from "@/components/ui/button";
import { Download, ArrowRight, Zap, Shield, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import LeadTablePreview from "./LeadTablePreview";
import { CheckoutModal } from "@/components/CheckoutModal";
import heroImage from "@/assets/hero-data-visual.jpg";

const ease = [0.16, 1, 0.3, 1];

const HeroSection = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-32 md:pb-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 h-96 w-96 bg-accent/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-20 left-1/4 h-80 w-80 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Background image strip */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[500px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.2, ease }}
      >
        <img src={heroImage} alt="" className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </motion.div>

      <div className="relative mx-auto max-w-6xl">
        <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
        <div className="mb-12 max-w-3xl md:mb-16">
          {/* Badge with animation */}
          <motion.div
            className="mb-4 flex items-center gap-2"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="font-mono-data inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
              <Zap className="h-3 w-3" />
              #1 em Extração de Leads
            </span>
            <span className="text-xs font-semibold text-accent">⭐ 4.9/5 (1,200+ reviews)</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            Extraia Leads em <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/70">Alta Velocidade</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.25 }}
          >
            Extraia milhares de contatos qualificados em segundos. Nomes, telefones, websites e endereços — tudo preparado para seu CRM.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { icon: Shield, text: "Sem Bloqueios" },
              { icon: Rocket, text: "100% Automático" },
              { icon: Zap, text: "Ultra Rápido" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full bg-accent/5 border border-accent/20 px-3 py-2">
                <item.icon className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow" 
              onClick={() => setCheckoutOpen(true)}
            >
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#how-it-works">Ver Como Funciona</a>
            </Button>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { value: "2,847+", label: "Leads por Extração" },
              { value: "12s", label: "Tempo Médio" },
              { value: "CSV/Excel", label: "Exportação Direta" },
            ].map((stat, i) => (
              <motion.div
                key={stat.value}
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.55 + i * 0.1 }}
              >
                <span className="font-mono-data text-2xl font-bold text-foreground">{stat.value}</span>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                {i < 2 && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-border" />}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Preview Section */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.5 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl opacity-50 blur-3xl" />
            <div className="relative">
              <LeadTablePreview />
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA Badge */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.8 }}
        >
          <div className="rounded-full border border-accent/20 bg-accent/5 px-6 py-3">
            <p className="text-center text-sm font-semibold text-accent">
              ✨ Garantia de 7 dias para teste completo
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
