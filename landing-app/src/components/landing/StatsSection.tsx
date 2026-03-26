import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, Target } from "lucide-react";

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const stats: Stat[] = [
  {
    value: "15,000+",
    label: "Usuários Ativos",
    icon: <Users className="h-6 w-6" />,
    description: "Clientes satisfeitos em todo Brasil"
  },
  {
    value: "500M+",
    label: "Leads Extraídos",
    icon: <Target className="h-6 w-6" />,
    description: "Contatos qualificados processados"
  },
  {
    value: "99.8%",
    label: "Taxa de Sucesso",
    icon: <Zap className="h-6 w-6" />,
    description: "Extração sem bloqueios com IA"
  },
  {
    value: "280%",
    label: "Aumento Médio",
    icon: <TrendingUp className="h-6 w-6" />,
    description: "Crescimento de vendas dos clientes"
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const StatsSection = () => {
  return (
    <section className="relative border-t border-border bg-card px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="group relative rounded-lg border border-border/50 bg-background p-6 text-center hover:border-accent/30 transition-all duration-300 hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
            >
              {/* Icon background glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <motion.div
                className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20"
                whileHover={{ rotate: 12, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.icon}
              </motion.div>

              <h3 className="relative z-10 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </h3>
              <p className="relative z-10 mt-1 font-semibold text-accent">{stat.label}</p>
              <p className="relative z-10 mt-2 text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
