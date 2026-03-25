import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";
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

      <div className="relative mx-auto max-w-6xl">
        <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />

        <div className="mb-12 max-w-3xl md:mb-16">
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease }}
          >
            <span
              className="font-mono-data inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(0,212,255,0.10)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "#00d4ff",
              }}
            >
              <span className="live-dot" />
              Ferramenta de extração B2B
            </span>
          </motion.div>

          <motion.h1
            className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
            style={{ color: "#f0f4ff" }}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            Extração de leads em{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#00d4ff,#10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              alta velocidade.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "hsl(220 15% 60%)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.25 }}
          >
            Extraia milhares de contatos qualificados em segundos. Nomes, emails, telefones e
            empresas — tudo pronto para importar no seu CRM.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
          >
            <Button
              size="xl"
              className="gap-2 font-bold"
              style={{
                background: "linear-gradient(135deg,#0099cc,#00d4ff)",
                color: "#000",
                boxShadow: "0 0 30px rgba(0,212,255,0.3), 0 4px 20px rgba(0,0,0,0.4)",
                border: "none",
              }}
              onClick={() => setCheckoutOpen(true)}
            >
              Adquirir Extrator
              <ArrowRight className="h-5 w-5" />
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
          </motion.div>

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
      </div>
    </section>
  );
};

export default HeroSection;
