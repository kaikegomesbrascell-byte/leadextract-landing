import { Check, X, Badge, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonFeature {
  name: string;
  leadextract: boolean | string;
  competitors: (boolean | string)[];
}

const features: ComparisonFeature[] = [
  { name: "Intervalos Humanos Inteligentes", leadextract: true, competitors: [false, false, false] },
  { name: "Extração Ilimitada", leadextract: true, competitors: [false, true, "Limitado"] },
  { name: "Anti-Duplicatas Avançado", leadextract: true, competitors: [false, false, false] },
  { name: "Exportação CSV/Excel", leadextract: true, competitors: [true, true, true] },
  { name: "Feedback Visual em Tempo Real", leadextract: true, competitors: [false, "Básico", false] },
  { name: "Atualizações Gratuitas Vitalícias", leadextract: true, competitors: [false, true, "Anual"] },
  { name: "Suporte Técnico Prioritário", leadextract: true, competitors: [false, "Email", "SMS"] },
  { name: "Dados Completos (Tel + Site + Endereço)", leadextract: true, competitors: [false, true, "Parcial"] },
  { name: "Sistema Anti-Bloqueio WhatsApp", leadextract: true, competitors: [false, false, false] },
  { name: "Facilidade de Uso", leadextract: "Excelente", competitors: ["Complexa", "Média", "Boa"] },
];

const ease = [0.16, 1, 0.3, 1] as const;

const renderCell = (value: boolean | string) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-emerald-500" />
    ) : (
      <X className="h-5 w-5 text-destructive/50" />
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
};

const ComparisonSection = () => {
  return (
    <section className="relative border-t border-border bg-background px-6 py-24 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-0 h-80 w-80 bg-accent/5 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 right-0 h-80 w-80 bg-accent/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="font-mono-data text-xs font-medium uppercase tracking-widest text-accent">Comparação</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Por que LeadExtract é a melhor escolha
          </h2>
          <p className="mt-4 text-muted-foreground">
            Compare com as alternativas e veja por que somos líderes em extração de leads
          </p>
        </motion.div>

        {/* Mobile view - Cards */}
        <div className="md:hidden space-y-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.name}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease, delay: i * 0.05 }}
            >
              <p className="font-semibold text-foreground">{feature.name}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">LeadExtract</span>
                  <div className="flex items-center justify-center">
                    {renderCell(feature.leadextract)}
                  </div>
                </div>
                {feature.competitors.map((comp, j) => (
                  <div key={j} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Alternativa {j + 1}</span>
                    <div className="flex items-center justify-center">
                      {renderCell(comp)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop view - Table */}
        <div className="hidden md:block overflow-x-auto">
          <motion.div
            className="rounded-lg border border-border bg-card overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Recurso</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        LeadExtract
                      </Badge>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Alternativa 1</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Alternativa 2</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Alternativa 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {features.map((feature, i) => (
                  <motion.tr
                    key={feature.name}
                    className="hover:bg-surface-alt/50 transition-colors duration-200"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {renderCell(feature.leadextract)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {renderCell(feature.competitors[0])}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {renderCell(feature.competitors[1])}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {renderCell(feature.competitors[2])}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          <p className="text-muted-foreground mb-4">
            Veja por si mesmo por que líderes de mercado escolhem LeadExtract
          </p>
          <div className="inline-flex rounded-lg border border-accent/20 bg-accent/5 px-4 py-2">
            <p className="text-sm font-semibold text-accent">🏆 #1 em satisfação de clientes</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
