import { Gift, FileText, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const ease = [0.16, 1, 0.3, 1] as const;

const BonusSection = () => {
  return (
    <section className="border-t border-border bg-muted/30 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <Badge className="mb-4 bg-accent text-white hover:bg-accent/90" variant="default">
            🎁 BÔNUS EXCLUSIVOS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Receba 2 Bônus de Alto Valor
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Além do Lead Extractor, você recebe gratuitamente 2 guias em PDF que vão 
            turbinar seus resultados e proteger seu negócio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Bônus 1 */}
          <motion.div
            className="rounded-lg border-2 border-accent/30 bg-background p-8 relative overflow-hidden hover:border-accent/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              BÔNUS #1
            </div>
            
            <div className="flex items-center gap-4 mb-4 mt-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Guia Anti-Ban WhatsApp
                </h3>
                <p className="text-sm text-accent font-semibold">Valor: R$ 97,00</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">
              Guia completo com técnicas comprovadas para proteger seu número de WhatsApp 
              ao fazer prospecção em massa. Evite banimentos e mantenha sua conta segura.
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Como evitar ser detectado como spam</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Intervalos ideais entre mensagens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Técnicas de aquecimento de conta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>O que fazer se for bloqueado</span>
              </li>
            </ul>
          </motion.div>

          {/* Bônus 2 */}
          <motion.div
            className="rounded-lg border-2 border-accent/30 bg-background p-8 relative overflow-hidden hover:border-accent/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              BÔNUS #2
            </div>
            
            <div className="flex items-center gap-4 mb-4 mt-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  3 Scripts de Vendas
                </h3>
                <p className="text-sm text-accent font-semibold">Valor: R$ 147,00</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">
              3 scripts de vendas de alta conversão prontos para usar com seus leads extraídos. 
              Aumente suas taxas de conversão desde o primeiro contato.
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Script de primeiro contato (quebra-gelo)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Script de follow-up (reengajamento)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Script de fechamento (conversão)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>Técnicas de persuasão comprovadas</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Valor total */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          <div className="inline-flex flex-col items-center gap-2 rounded-lg border-2 border-accent bg-accent/5 px-8 py-6">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-accent" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Valor Total dos Bônus:</p>
                <p className="text-3xl font-bold text-foreground">R$ 244,00</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-accent">
              GRÁTIS ao adquirir o Lead Extractor hoje!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BonusSection;
