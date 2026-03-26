import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

const ease = [0.16, 1, 0.3, 1] as const;

const GuaranteeSection = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section className="border-t border-border bg-gradient-to-b from-accent/5 to-background px-6 py-20 md:py-28">
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 border-accent bg-background shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
        >
          {/* Badge de destaque */}
          <div className="absolute -right-12 top-8 rotate-45 bg-accent px-16 py-2 text-center text-sm font-bold uppercase text-white shadow-lg">
            Garantia
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              {/* Ícone */}
              <motion.div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
              >
                <Shield className="h-10 w-10 text-accent" />
              </motion.div>

              {/* Título principal */}
              <motion.h2
                className="mb-4 text-3xl md:text-5xl font-extrabold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.3 }}
              >
                Garantia Incondicional de 7 Dias
              </motion.h2>

              {/* Subtítulo impactante */}
              <motion.div
                className="mb-8 max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.4 }}
              >
                <p className="text-xl md:text-2xl font-semibold text-accent mb-4">
                  "Se em 7 dias você não extrair seus primeiros 500 leads, eu devolvo cada centavo."
                </p>
                <p className="text-lg text-muted-foreground">
                  Isso tira o peso da decisão das suas costas e coloca no nosso software. 
                  E nós sabemos que ele funciona.
                </p>
              </motion.div>

              {/* Benefícios da garantia */}
              <motion.div
                className="mb-8 grid gap-4 text-left md:grid-cols-3 w-full max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.5 }}
              >
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Sem Perguntas</h3>
                    <p className="text-sm text-muted-foreground">
                      Não gostou? Devolvo 100% do seu dinheiro, sem burocracia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Risco Zero</h3>
                    <p className="text-sm text-muted-foreground">
                      Teste o sistema por 7 dias completos sem nenhum risco.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Suporte Total</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajudamos você a extrair seus primeiros 500 leads.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.6 }}
              >
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="gap-2 text-lg px-8 py-6"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Começar Agora Sem Riscos
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  🔄 Assinatura mensal de R$ 1.000,00 • Garantia de 7 dias • Cancele quando quiser
                </p>
              </motion.div>

              {/* Nota de confiança */}
              <motion.div
                className="mt-8 rounded-lg bg-accent/5 border border-accent/20 p-6 max-w-2xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.7 }}
              >
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">Por que oferecemos essa garantia?</strong><br />
                  Porque confiamos 100% no nosso sistema. Milhares de usuários já extraíram 
                  centenas de milhares de leads com sucesso. Queremos que você tenha a mesma 
                  experiência, sem riscos.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
