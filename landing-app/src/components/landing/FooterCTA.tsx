import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import heroImage from "@/assets/hero-data-visual.jpg";

const ease = [0.16, 1, 0.3, 1] as const;

const FooterCTA = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-primary px-6 py-24 text-center md:py-32">
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.15 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <img src={heroImage} alt="" className="h-full w-full object-cover" loading="lazy" />
      </motion.div>
      <div className="absolute inset-0 bg-primary/80 pointer-events-none" />

      <div className="relative mx-auto max-w-2xl">
        <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
        <motion.h2
          className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          Pare de perder tempo buscando leads manualmente.
        </motion.h2>
        <motion.p
          className="mt-4 text-primary-foreground/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Comece a extrair leads qualificados agora mesmo e acelere suas vendas.
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.25 }}
        >
          <Button variant="hero" size="xl" className="gap-2" onClick={() => setCheckoutOpen(true)}>
            Começar Agora
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-2 text-primary-foreground/40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Zap className="h-4 w-4" />
          <span className="text-sm">LeadExtract © {new Date().getFullYear()}</span>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterCTA;
