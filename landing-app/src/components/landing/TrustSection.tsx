import { motion } from "framer-motion";
import { Shield, Award, Lock, Zap, Heart, Rocket } from "lucide-react";

interface Badge {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const badges: Badge[] = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Segurança de Dados",
    description: "Criptografia SSL 256-bit para proteger seus dados",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "100% Privado",
    description: "Seus dados nunca são compartilhados com terceiros",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Mais Testado",
    description: "100.000+ horas de testes contínuos",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Garantia 7 Dias",
    description: "Reembolso total ou seu dinheiro de volta",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "IA de Última Geração",
    description: "Tecnologia anti-bloqueio mais avançada do mercado",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Suporte 24/7",
    description: "Equipe pronta para resolver qualquer dúvida",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const TrustSection = () => {
  return (
    <section className="relative border-t border-border bg-card px-6 py-20 md:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 h-96 w-96 bg-accent/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="font-mono-data text-xs font-medium uppercase tracking-widest text-accent">Segurança</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl max-w-2xl mx-auto">
            Confie em uma plataforma segura e confiável
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Proteção de ponta a ponta com tecnologia enterprise
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              className="group rounded-lg border border-border bg-background p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-md hover:bg-accent/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
            >
              <motion.div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {badge.icon}
              </motion.div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{badge.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{badge.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Certification marks */}
        <motion.div
          className="mt-16 rounded-lg border border-accent/20 bg-accent/5 p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-accent mb-6">CERTIFICAÇÕES & PARCERIAS</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center">
            {[
              "🛡️ LGPD Compliant",
              "🔐 ISO 27001",
              "💳 PCI DSS",
              "✅ SOC 2 Type II",
              "🏆 Trusted by 15K+",
            ].map((cert, i) => (
              <motion.div
                key={i}
                className="text-xs font-semibold text-muted-foreground text-center px-4 py-3 rounded-lg border border-border/50 bg-background hover:bg-card transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {cert}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center border-t border-border/30 pt-6">
            <p className="text-sm text-muted-foreground">
              ✨ <span className="font-semibold text-foreground">Protegido por Garantia de 7 Dias</span> — Seu dinheiro de volta se não gostar
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
