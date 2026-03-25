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
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(10,15,30,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 0 0 1px rgba(0,212,255,0.08), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="scan-bar" />
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 font-mono-data text-xs" style={{ color: "hsl(220 15% 45%)" }}>
          leads_export.csv — 2.847 leads extraídos
        </span>
        <span
          className="ml-auto font-mono-data text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
        >
          ● AO VIVO
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
              {["Nome", "Email", "Empresa", "Telefone"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2.5 text-left font-mono-data text-xs font-medium uppercase tracking-wider${i >= 2 ? " hidden sm:table-cell" : ""}${i === 3 ? " hidden md:table-cell" : ""}`}
                  style={{ color: "hsl(220 15% 45%)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <motion.tr
                key={i}
                className="lead-row border-b last:border-0 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.8 + i * 0.12 }}
                whileHover={{ background: "rgba(0,212,255,0.03)" }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "#f0f4ff" }}>
                  {lead.name}
                </td>
                <td className="px-4 py-3 font-mono-data text-xs" style={{ color: "#00d4ff" }}>
                  {lead.email}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "hsl(220 15% 55%)" }}>
                  {lead.company}
                </td>
                <td
                  className="px-4 py-3 font-mono-data text-xs hidden md:table-cell"
                  style={{ color: "hsl(220 15% 50%)" }}
                >
                  {lead.phone}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTablePreview;
