import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

const benefits = [
  "🛡️ Intervalos Humanos Inteligentes - Protege seu WhatsApp",
  "Extração ilimitada de leads do Google Maps",
  "Exportação CSV e Excel automática",
  "Sistema anti-duplicatas inteligente",
  "Feedback visual em tempo real",
  "Atualizações gratuitas vitalícias",
  "Suporte técnico via email",
];

const ease = [0.16, 1, 0.3, 1] as const;

const PricingSection = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section id="pricing" className="border-t border-border bg-card px-6 py-24 md:py-32">
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="font-mono-data text-xs font-medium uppercase tracking-widest text-accent">Preço</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Assinatura Mensal. Acesso Completo.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Extraia leads ilimitados por apenas R$ 1.000/mês. Cancele quando quiser.
          </p>
        </motion.div>

        {/* MERCHAN COM DESCONTO IMPRESSIONANTE */}
        <motion.div
          className="mt-10 rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(0,212,255,0.15) 100%)",
            border: "2px solid rgba(255,0,127,0.5)",
            boxShadow: "0 0 80px rgba(255,0,127,0.3), inset 0 0 60px rgba(0,212,255,0.1)",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          {/* Efeito de spotlight */}
          <div
            className="absolute top-0 right-0 w-96 h-96 blur-3xl opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,0,127,0.8) 0%, transparent 70%)",
            }}
          />
          
          <div className="relative z-10">
            {/* Badge de urgência */}
            <div className="flex justify-center mb-4">
              <motion.div
                className="inline-block rounded-full px-4 py-1.5"
                style={{
                  background: "linear-gradient(135deg, #ff007f, #ff4db8)",
                  boxShadow: "0 0 20px rgba(255,0,127,0.6)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,0,127,0.4)",
                    "0 0 40px rgba(255,0,127,0.8)",
                    "0 0 20px rgba(255,0,127,0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-white">
                  🎯 OFERTA 87% OFF - MERCHAN DO DIA
                </p>
              </motion.div>
            </div>

            {/* Comparação de preços */}
            <div className="flex items-center justify-center gap-6">
              {/* Preço original */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
              >
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Valor Original
                </p>
                <p
                  className="text-3xl font-extrabold mt-2 line-through decoration-2"
                  style={{ color: "rgba(255,0,127,0.8)" }}
                >
                  R$ 7.983
                </p>
              </motion.div>

              {/* Seta/Redução */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div
                  className="text-3xl font-bold px-4 py-2 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #ff007f, #ff4db8)",
                    color: "white",
                  }}
                >
                  ➜
                </div>
              </motion.div>

              {/* Preço com desconto */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.3 }}
              >
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Agora por
                </p>
                <p
                  className="text-4xl font-extrabold mt-2"
                  style={{
                    background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  R$ 1.000
                </p>
              </motion.div>
            </div>

            {/* Economia */}
            <motion.div
              className="mt-6 text-center p-4 rounded-lg"
              style={{
                background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.3)",
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.4 }}
            >
              <p className="text-2xl font-extrabold text-green-500">
                💰 Você economiza R$ 6.983
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Essa promoção é por tempo limitado. Aproveite enquanto dura!
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 rounded-lg border-2 border-accent/40 bg-background p-8 shadow-lg"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
        >
          <div className="mb-6">
            <span className="font-mono-data text-xs font-medium uppercase tracking-widest text-accent">Assinatura Mensal</span>
            <div className="mt-3 flex items-baseline justify-center gap-1">
              <motion.span
                className="text-5xl font-extrabold tracking-tight text-foreground"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.3 }}
              >
                R$ 1.000
              </motion.span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <div className="mt-3 inline-block rounded-lg bg-accent px-6 py-2">
              <p className="text-xl font-bold uppercase tracking-wide text-white">
                🔄 ASSINATURA MENSAL
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Cancele quando quiser. Sem fidelidade. Extrações ilimitadas.</p>
          </div>

          <ul className="mb-8 space-y-3 text-left">
            {benefits.map((benefit, i) => (
              <motion.li
                key={benefit}
                className="flex items-center gap-3 text-sm text-foreground"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: 0.35 + i * 0.06 }}
              >
                <Check className="h-4 w-4 shrink-0 text-accent" />
                {benefit}
              </motion.li>
            ))}
          </ul>

          <Button variant="hero" size="xl" className="w-full gap-2" onClick={() => setCheckoutOpen(true)}>
            Comprar Agora
            <ArrowRight className="h-5 w-5" />
          </Button>

          <div className="mt-4 rounded-lg bg-accent/10 border border-accent/30 p-4">
            <p className="text-sm font-semibold text-accent text-center flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Garantia de 7 dias ou seu dinheiro de volta
            </p>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Pagamento seguro via PIX
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
