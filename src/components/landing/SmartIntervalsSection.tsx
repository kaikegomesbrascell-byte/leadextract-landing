import { Shield, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const ease = [0.16, 1, 0.3, 1] as const;

const SmartIntervalsSection = () => {
  return (
    <section className="border-t border-border bg-accent/5 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <Badge className="mb-4 bg-accent text-white hover:bg-accent/90" variant="default">
            🛡️ PROTEÇÃO PREMIUM
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Intervalos Humanos Inteligentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Tecnologia exclusiva que simula comportamento humano real, protegendo seu número de WhatsApp 
            e garantindo extrações seguras sem bloqueios do Google Maps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Sem Proteção */}
          <motion.div
            className="rounded-lg border-2 border-destructive/30 bg-background p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Sem Proteção</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive mt-0.5">✗</span>
                <span>Extração rápida demais parece robô</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive mt-0.5">✗</span>
                <span>Google Maps detecta e bloqueia seu IP</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive mt-0.5">✗</span>
                <span>Seu WhatsApp pode ser banido por spam</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive mt-0.5">✗</span>
                <span>Dados incompletos ou incorretos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive mt-0.5">✗</span>
                <span>Risco de perder sua conta comercial</span>
              </li>
            </ul>
          </motion.div>

          {/* Com Proteção */}
          <motion.div
            className="rounded-lg border-2 border-accent bg-accent/5 p-6 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              INCLUÍDO
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20 text-accent">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Com Intervalos Inteligentes</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span><strong>Delays naturais</strong> entre cada ação (scroll, clique, leitura)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span><strong>Comportamento humano</strong> simulado com variações aleatórias</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span><strong>Proteção do WhatsApp</strong> - evita banimento por spam</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span><strong>Sem bloqueios</strong> do Google Maps ou outras plataformas</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span><strong>Extração segura</strong> e confiável a longo prazo</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Explicação técnica */}
        <motion.div
          className="mt-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Por que isso vale R$ 297,00?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ferramentas baratas ou gratuitas extraem dados de forma agressiva, sem proteção. 
                  Isso resulta em <strong className="text-foreground">bloqueios do Google Maps</strong>, 
                  <strong className="text-foreground"> banimento do WhatsApp</strong> e 
                  <strong className="text-foreground"> perda de contas comerciais</strong>. 
                  Nosso sistema com Intervalos Humanos Inteligentes protege seu investimento, 
                  garantindo extrações seguras e sustentáveis. <strong className="text-accent">Você paga uma vez 
                  e usa para sempre, sem riscos.</strong>
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
