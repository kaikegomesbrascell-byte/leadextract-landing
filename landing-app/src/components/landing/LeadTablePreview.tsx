import { motion } from "framer-motion";

const leads = [
  { name: "Carlos Mendes", email: "carlos@empresa.com.br", company: "TechBR", phone: "(11) 98432-1234" },
  { name: "Ana Rodrigues", email: "ana.r@startup.io", company: "GrowthLab", phone: "(21) 97654-8821" },
  { name: "Pedro Santana", email: "pedro@vendas.net", company: "VendasPro", phone: "(31) 99112-4456" },
  { name: "Juliana Costa", email: "ju.costa@mkt.com", company: "DigitalMKT", phone: "(41) 98877-3301" },
  { name: "Rafael Lima", email: "rlima@consultoria.co", company: "ConsultMax", phone: "(51) 99203-7789" },
];

const LeadTablePreview = () => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-destructive/60" />
        <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
        <div className="h-3 w-3 rounded-full bg-accent/60" />
        <span className="ml-3 font-mono-data text-xs text-muted-foreground">leads_export.csv — 2.847 leads extraídos</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-mono-data text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome</th>
              <th className="px-4 py-2.5 text-left font-mono-data text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="px-4 py-2.5 text-left font-mono-data text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Empresa</th>
              <th className="px-4 py-2.5 text-left font-mono-data text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <motion.tr
                key={i}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.8 + i * 0.12,
                }}
              >
                <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                <td className="px-4 py-3 font-mono-data text-xs text-accent">{lead.email}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{lead.company}</td>
                <td className="px-4 py-3 font-mono-data text-xs text-muted-foreground hidden md:table-cell">{lead.phone}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTablePreview;
